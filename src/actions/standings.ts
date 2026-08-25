"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";
import { TeamContext } from "../../generated/prisma";
import { resolveAndSaveTournamentSeason } from "@/lib/services/sofascore-standings.service";

export async function executeStandingsSync(
  teamContext?: TeamContext,
  tournamentId?: string,
  seasonId?: string,
) {
  try {
    const activeSeason = seasonId
      ? await prisma.season.findUnique({ where: { id: seasonId } })
      : await prisma.season.findFirst({ where: { isActive: true } });

    if (!activeSeason) {
      throw new Error("Не знайдено сезону для синхронізації.");
    }

    const tournaments = await prisma.tournament.findMany({
      where: {
        hasStandings: true,
        deletedAt: null,
        ...(tournamentId ? { id: tournamentId } : {}),
        ...(teamContext ? { teamContext } : {}),
      },
      include: {
        tournamentSeasons: {
          where: { seasonId: activeSeason.id },
        },
      },
    });

    if (tournaments.length === 0) {
      return {
        success: true,
        message: "Немає турнірів для оновлення таблиць.",
      };
    }

    let totalUpdated = 0;
    const skippedTournaments: string[] = [];

    for (const tournament of tournaments) {
      if (!tournament.sofascoreId) continue;

      let tournamentSeason = tournament.tournamentSeasons[0];

      if (!tournamentSeason) {
        console.log(
          `[standings] Немає TournamentSeason для ${tournament.slug} у сезоні ${activeSeason.name}. Резолвлю автоматично...`,
        );
        const saved = await resolveAndSaveTournamentSeason(
          tournament,
          activeSeason,
        );

        if (!saved) {
          console.error(
            `[standings] Не вдалося автоматично резолвити сезон для ${tournament.slug}. Пропускаю.`,
          );
          skippedTournaments.push(tournament.slug);
          continue;
        }
        tournamentSeason = saved;
      }

      const response = await fetch(
        `https://sofascore.p.rapidapi.com/tournaments/get-standings?tournamentId=${tournament.sofascoreId}&seasonId=${tournamentSeason.sofascoreSeasonId}&type=total`,
        {
          headers: {
            "x-rapidapi-host": "sofascore.p.rapidapi.com",
            "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        console.error(
          `[standings] HTTP ${response.status} для турніру ${tournament.slug} (sofascoreSeasonId=${tournamentSeason.sofascoreSeasonId})`,
        );
        skippedTournaments.push(tournament.slug);
        continue;
      }

      const data = await response.json();
      const rows = data.standings?.[0]?.rows;

      if (!rows) {
        console.error(
          `[standings] Невалідний body для турніру ${tournament.slug}: ${JSON.stringify(data).slice(0, 300)}`,
        );
        skippedTournaments.push(tournament.slug);
        continue;
      }

      const tournamentSeasonId = tournamentSeason.id;

      await prisma.$transaction(
        async (tx) => {
          const teamIds = rows.map((r: { team: { id: number } }) => r.team.id);

          const existingDictionary = await tx.teamDictionary.findMany({
            where: { sofascoreId: { in: teamIds } },
            include: { translations: true },
          });
          const dictionaryMap = new Map<
            number,
            (typeof existingDictionary)[0]
          >();
          existingDictionary.forEach((item) => {
            dictionaryMap.set(item.sofascoreId, item);
          });

          await tx.standing.deleteMany({
            where: { tournamentSeasonId },
          });

          const insertData = [];

          for (const row of rows) {
            const teamId = row.team.id;
            const originalName = row.team.name;
            let localizedName = originalName;
            const dictEntry = dictionaryMap.get(teamId);

            if (dictEntry) {
              const ukTranslation = dictEntry.translations.find(
                (t) => t.language === "uk",
              );
              if (ukTranslation) localizedName = ukTranslation.name;
            } else {
              const newDictEntry = await tx.teamDictionary.create({
                data: {
                  sofascoreId: teamId,
                  originalName,
                  teamContext: tournament.teamContext,
                  translations: {
                    create: [
                      { language: "uk", name: originalName },
                      { language: "en", name: originalName },
                    ],
                  },
                },
                include: { translations: true },
              });
              dictionaryMap.set(teamId, newDictEntry);
            }

            insertData.push({
              rank: row.position,
              teamName: localizedName,
              teamLogo: `https://img.sofascore.com/api/v1/team/${row.team.id}/image`,
              points: row.points,
              played: row.matches,
              win: row.wins,
              draw: row.draws,
              lose: row.losses,
              goalsFor: row.scoresFor,
              goalsAgainst: row.scoresAgainst,
              goalsDiff: row.scoresFor - row.scoresAgainst,
              tournamentSeasonId,
            });
          }

          await tx.standing.createMany({ data: insertData });
          totalUpdated += rows.length;
        },
        { maxWait: 10000, timeout: 30000 },
      );
    }

    if (totalUpdated > 0) {
      LOCALES.forEach((locale) => {
        revalidatePath(`/${locale}/standings`, "layout");
        revalidatePath(`/${locale}/admin/tournaments/standings`);
        revalidatePath(`/${locale}/`);
      });
    }

    return {
      success: true,
      updated: totalUpdated,
      message:
        skippedTournaments.length > 0
          ? `Оновлено ${totalUpdated} команд. Пропущено: ${skippedTournaments.join(", ")} (див. логи сервера).`
          : `Оновлено ${totalUpdated} команд у таблицях!`,
    };
  } catch (error) {
    console.error("Sync Standings Error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Невідома помилка при оновленні",
    };
  }
}

export async function executeTournamentSeasonsBootstrap(seasonId?: string) {
  try {
    const season = seasonId
      ? await prisma.season.findUnique({ where: { id: seasonId } })
      : await prisma.season.findFirst({ where: { isActive: true } });

    if (!season) {
      return { success: false, message: "Сезон не знайдено." };
    }

    const tournaments = await prisma.tournament.findMany({
      where: {
        hasStandings: true,
        sofascoreId: { not: null },
        deletedAt: null,
      },
    });

    if (tournaments.length === 0) {
      return {
        success: true,
        message: "Немає турнірів для резолву.",
        results: [],
      };
    }

    const results: {
      slug: string;
      success: boolean;
      sofascoreSeasonId?: number;
    }[] = [];

    for (const tournament of tournaments) {
      const saved = await resolveAndSaveTournamentSeason(tournament, season);

      results.push(
        saved
          ? {
              slug: tournament.slug,
              success: true,
              sofascoreSeasonId: saved.sofascoreSeasonId,
            }
          : { slug: tournament.slug, success: false },
      );
    }

    const failed = results.filter((r) => !r.success);

    return {
      success: true,
      message:
        failed.length > 0
          ? `Резолвлено ${results.length - failed.length}/${results.length}. Не вдалося: ${failed
              .map((f) => f.slug)
              .join(", ")} (див. логи сервера).`
          : `Успішно резолвлено всі ${results.length} турнірів для сезону ${season.name}.`,
      results,
    };
  } catch (error) {
    console.error("Tournament Seasons Bootstrap Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Невідома помилка",
    };
  }
}
