"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES, TEAM_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { processMatchSync } from "@/lib/services/match-details.service";
import { MatchStatus, TeamContext } from "../../generated/prisma";
import { createManualMatchSchema, updateMatchSchema } from "@/lib/schemas";
import { z } from "zod";

export async function revalidateMatchPaths(
  slug?: string,
  oldSlug?: string,
  playerSlugs?: string[],
) {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/admin/tournaments/matches`);
    revalidatePath(`/${locale}/matches`, "layout");
    revalidatePath(`/${locale}`);

    if (slug) {
      revalidatePath(`/${locale}/matches/${slug}`);
    }
    if (oldSlug && oldSlug !== slug) {
      revalidatePath(`/${locale}/matches/${oldSlug}`);
    }

    if (playerSlugs && playerSlugs.length > 0) {
      playerSlugs.forEach((playerSlug) => {
        revalidatePath(`/${locale}/team/${playerSlug}`);
      });
    }
  });
}

async function validateMatchDateWithinSeason(
  seasonId: string,
  date: Date,
): Promise<string | null> {
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    select: { name: true, startDate: true, endDate: true },
  });

  if (season && season.startDate && season.endDate) {
    const minDate = new Date(season.startDate);
    const maxDate = new Date(season.endDate);
    maxDate.setUTCHours(23, 59, 59, 999);

    if (date < minDate || date > maxDate) {
      return `Дата повинна бути в межах сезону ${season.name}`;
    }
  }

  return null;
}

const mapMatchStatus = (sofaStatus: string): MatchStatus => {
  switch (sofaStatus) {
    case "finished":
      return MatchStatus.FINISHED;
    case "notstarted":
      return MatchStatus.SCHEDULED;
    case "inprogress":
      return MatchStatus.LIVE;
    case "postponed":
      return MatchStatus.POSTPONED;
    case "canceled":
      return MatchStatus.CANCELED;
    default:
      return MatchStatus.SCHEDULED;
  }
};
export type BoundMatchData = z.infer<typeof createManualMatchSchema>;
export type BoundMatchUpdateData = z.infer<typeof updateMatchSchema>;

export type MatchFormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function forceSyncMatchDetails(matchId: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const result = await processMatchSync(matchId);

    if (result.success) {
      revalidateMatchPaths();
      return { success: true, message: "Деталі матчу успішно синхронізовано!" };
    } else {
      return {
        success: false,
        message: result.error || "Не вдалося синхронізувати матч",
      };
    }
  } catch (error) {
    console.error("Force sync error:", error);
    return {
      success: false,
      message: "Внутрішня помилка сервера при синхронізації",
    };
  }
}

export async function softDeleteMatch(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.match.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidateMatchPaths();
    return { success: true, message: "Матч переміщено в кошик" };
  } catch {
    return { success: false, message: "Помилка архівації матчу" };
  }
}
export async function restoreMatch(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.match.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidateMatchPaths();
    return { success: true, message: "Матч успішно відновлено!" };
  } catch {
    return { success: false, message: "Помилка відновлення матчу" };
  }
}

export async function hardDeleteMatch(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.match.delete({
      where: { id },
    });

    revalidateMatchPaths();
    return { success: true, message: "Матч остаточно видалено з бази даних!" };
  } catch (error) {
    console.error("Hard delete match error:", error);
    return {
      success: false,
      message: "Помилка при остаточному видаленні.",
    };
  }
}
async function fetchMatchesFromSofaScore(endpoint: string) {
  const response = await fetch(
    `https://sofascore.p.rapidapi.com/teams/${endpoint}?teamId=${TEAM_ID}`,
    {
      headers: {
        "x-rapidapi-host": "sofascore.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`API error fetching ${endpoint}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.events || [];
}

export async function syncMatchScheduleAction() {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, error: "Немає прав доступу" };
  }

  try {
    const activeSeason = await prisma.season.findFirst({
      where: { isActive: true },
    });

    if (!activeSeason) {
      return { success: false, error: "Не знайдено активного сезону в базі." };
    }

    const pastMatches = await fetchMatchesFromSofaScore("get-last-matches");
    const futureMatches = await fetchMatchesFromSofaScore("get-next-matches");

    const rawMatches = [...pastMatches, ...futureMatches];
    const uniqueMatchesMap = new Map();
    for (const match of rawMatches) {
      uniqueMatchesMap.set(match.id, match);
    }
    const allMatches = Array.from(uniqueMatchesMap.values());

    if (allMatches.length === 0) {
      throw new Error("Не знайдено матчів у відповіді API");
    }

    let createdCount = 0;
    let updatedCount = 0;

    await prisma.$transaction(
      async (tx) => {
        for (const event of allMatches) {
          const matchDate = new Date(event.startTimestamp * 1000);

          if (
            matchDate < activeSeason.startDate ||
            matchDate > activeSeason.endDate
          ) {
            continue;
          }

          const isHomeGame = Number(event.homeTeam.id) === Number(TEAM_ID);
          const opponentData = isHomeGame ? event.awayTeam : event.homeTeam;

          let tournament = await tx.tournament.findFirst({
            where: {
              OR: [
                { sofascoreId: event.tournament.uniqueTournament.id },
                { slug: event.tournament.slug },
              ],
            },
          });

          if (!tournament) {
            tournament = await tx.tournament.create({
              data: {
                slug: event.tournament.slug,
                sofascoreId: event.tournament.uniqueTournament.id,
                translations: {
                  create: [
                    {
                      language: "uk",
                      name: event.tournament.uniqueTournament.name,
                    },
                    {
                      language: "en",
                      name: event.tournament.uniqueTournament.name,
                    },
                  ],
                },
              },
            });
          } else if (tournament.sofascoreId === null) {
            tournament = await tx.tournament.update({
              where: { id: tournament.id },
              data: { sofascoreId: event.tournament.uniqueTournament.id },
            });
          }

          let opponent = await tx.opponent.findFirst({
            where: {
              OR: [
                { sofascoreId: opponentData.id },
                { slug: opponentData.slug },
              ],
            },
          });
          if (!opponent) {
            opponent = await tx.opponent.create({
              data: {
                slug: opponentData.slug,
                sofascoreId: opponentData.id,
                logoUrl: `https://img.sofascore.com/api/v1/team/${opponentData.id}/image`,
                translations: {
                  create: [
                    { language: "uk", name: opponentData.name },
                    { language: "en", name: opponentData.name },
                  ],
                },
              },
            });
          } else {
            opponent = await tx.opponent.update({
              where: { id: opponent.id },
              data: {
                ...(opponent.sofascoreId === null && {
                  sofascoreId: opponentData.id,
                }),
                logoUrl: `https://img.sofascore.com/api/v1/team/${opponentData.id}/image`,
              },
            });
          }

          const sofascoreId = event.id;
          const matchStatus = mapMatchStatus(event.status.type);
          const round = event.roundInfo?.round || null;
          const homeScore = event.homeScore?.current ?? null;
          const awayScore = event.awayScore?.current ?? null;
          const uniqueMatchSlug = `${event.slug}-${sofascoreId}`;

          const existingMatch = await tx.match.findUnique({
            where: { sofascoreId },
          });

          if (existingMatch) {
            await tx.match.update({
              where: { id: existingMatch.id },
              data: {
                slug: uniqueMatchSlug,
                date: matchDate,
                startTimestamp: event.startTimestamp,
                status: matchStatus,
                round,
                homeScore,
                awayScore,
              },
            });
            updatedCount++;
          } else {
            await tx.match.create({
              data: {
                slug: uniqueMatchSlug,
                sofascoreId,
                date: matchDate,
                startTimestamp: event.startTimestamp,
                status: matchStatus,
                round,
                isHomeGame,
                homeScore,
                awayScore,
                teamContext: TeamContext.MAIN_TEAM,
                seasonId: activeSeason.id,
                tournamentId: tournament.id,
                opponentId: opponent.id,
              },
            });
            createdCount++;
          }
        }
      },
      { maxWait: 10000, timeout: 30000 },
    );

    revalidateMatchPaths();

    return { success: true, created: createdCount, updated: updatedCount };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Невідома помилка";
    console.error("Sync Matches Action Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function createManualMatch(
  boundData: BoundMatchData,
  _prevState: MatchFormState | undefined,
  _formData: FormData,
): Promise<MatchFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = createManualMatchSchema.safeParse(boundData);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;

    const dateError = await validateMatchDateWithinSeason(
      data.seasonId,
      data.date,
    );
    if (dateError) {
      return {
        errors: { date: [dateError] },
        message: "Перевірте дату матчу",
      };
    }

    const opponent = await prisma.opponent.findUnique({
      where: { id: data.opponentId },
      select: { slug: true },
    });

    if (!opponent) {
      return { message: "Обраного суперника не знайдено" };
    }

    const dateUnix = Math.floor(data.date.getTime() / 1000);
    const slug = data.isHomeGame
      ? `emeraldgang-vs-${opponent.slug}-${dateUnix}`
      : `${opponent.slug}-vs-emeraldgang-${dateUnix}`;

    await prisma.match.create({
      data: {
        slug,
        date: data.date,
        startTimestamp: dateUnix,
        status: MatchStatus.SCHEDULED,
        isHomeGame: data.isHomeGame,
        teamContext: data.teamContext,
        opponent: { connect: { id: data.opponentId } },
        season: { connect: { id: data.seasonId } },
        tournament: { connect: { id: data.tournamentId } },
        stadium:
          data.stadium && data.stadium.trim() !== "" ? data.stadium : null,
        homeCoachName:
          data.homeCoachName && data.homeCoachName.trim() !== ""
            ? data.homeCoachName
            : null,
        awayCoachName:
          data.awayCoachName && data.awayCoachName.trim() !== ""
            ? data.awayCoachName
            : null,
        round: data.round || null,
      },
    });
    revalidateMatchPaths();
    return {
      success: true,
      message: "Матч успішно створено!",
    };
  } catch (error) {
    console.error("Error creating manual match:", error);
    return {
      message: "Сталася помилка при створенні матчу",
    };
  }
}

export async function updateMatch(
  matchId: string,
  boundData: BoundMatchUpdateData,
  _prevState: MatchFormState | undefined,
  _formData: FormData,
): Promise<MatchFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
      select: { slug: true, isDetailsSynced: true },
    });

    if (!existingMatch) {
      return { message: "Матч не знайдено" };
    }

    const validatedFields = updateMatchSchema.safeParse(boundData);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;

    const dateError = await validateMatchDateWithinSeason(
      data.seasonId,
      data.date,
    );
    if (dateError) {
      return {
        errors: { date: [dateError] },
        message: "Перевірте дату матчу",
      };
    }

    const opponent = await prisma.opponent.findUnique({
      where: { id: data.opponentId },
      select: { slug: true },
    });

    if (!opponent) {
      return { message: "Обраного суперника не знайдено" };
    }

    const dateUnix = Math.floor(data.date.getTime() / 1000);
    const newSlug = data.isHomeGame
      ? `emeraldgang-vs-${opponent.slug}-${dateUnix}`
      : `${opponent.slug}-vs-emeraldgang-${dateUnix}`;

    await prisma.match.update({
      where: { id: matchId },
      data: {
        slug: newSlug,
        date: data.date,
        startTimestamp: dateUnix,
        status: data.status,
        round: data.round || null,
        isHomeGame: data.isHomeGame,
        teamContext: data.teamContext,
        homeScore: data.homeScore ?? null,
        awayScore: data.awayScore ?? null,
        stadium:
          data.stadium && data.stadium.trim() !== "" ? data.stadium : null,
        homeCoachName:
          data.homeCoachName && data.homeCoachName.trim() !== ""
            ? data.homeCoachName
            : null,
        awayCoachName:
          data.awayCoachName && data.awayCoachName.trim() !== ""
            ? data.awayCoachName
            : null,
        highlightsUrl:
          data.highlightsUrl && data.highlightsUrl.trim() !== ""
            ? data.highlightsUrl
            : null,
        postMatchUrl:
          data.postMatchUrl && data.postMatchUrl.trim() !== ""
            ? data.postMatchUrl
            : null,

        season: { connect: { id: data.seasonId } },
        tournament: { connect: { id: data.tournamentId } },
        opponent: { connect: { id: data.opponentId } },

        lineup: data.emeraldGangLineup
          ? {
              deleteMany: {},
              create: data.emeraldGangLineup.map((player) => ({
                playerId: player.playerId,
                isStarter: player.isStarter,
                played: player.played,
              })),
            }
          : undefined,

        events: data.events
          ? {
              deleteMany: {},
              create: data.events.map((event) => ({
                type: event.type,
                minute: event.minute,
                playerId: event.playerId || null,
                customPlayerName: event.customPlayerName || null,
                isOpponent: event.isOpponent,
              })),
            }
          : undefined,
      },
    });

    const playerIds = new Set<string>();

    if (data.emeraldGangLineup) {
      data.emeraldGangLineup
        .filter((p) => p.played)
        .forEach((p) => playerIds.add(p.playerId));
    }
    if (data.events) {
      data.events.forEach((e) => {
        if (e.playerId) playerIds.add(e.playerId);
      });
    }

    let playerSlugs: string[] = [];
    if (playerIds.size > 0) {
      const players = await prisma.player.findMany({
        where: { id: { in: Array.from(playerIds) } },
        select: { slug: true },
      });
      playerSlugs = players.map((p) => p.slug);
    }

    revalidateMatchPaths(newSlug, existingMatch.slug, playerSlugs);

    return {
      success: true,
      message: "Матч успішно оновлено!",
    };
  } catch (error) {
    console.error("Error updating match:", error);
    return {
      message: "Сталася помилка при оновленні матчу",
    };
  }
}
