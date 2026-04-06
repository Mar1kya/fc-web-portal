import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const authHeader = request.headers.get("authorization");

  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManualTest = key === process.env.CRON_SECRET;

  if (!isVercelCron && !isManualTest) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const activeSeason = await prisma.season.findFirst({
      where: { isActive: true },
    });
    const tournament = await prisma.tournament.findUnique({
      where: { slug: "upl" },
    });

    if (!activeSeason || !activeSeason.sofascoreId) {
      throw new Error(
        "The active season or its Sofascore ID was not found in the database.",
      );
    }
    if (!tournament || !tournament.sofascoreId) {
      throw new Error("UPL tournament not found in the database");
    }

    const tournamentId = tournament.sofascoreId;
    const seasonId = activeSeason.sofascoreId;

    const response = await fetch(
      `https://sofascore.p.rapidapi.com/tournaments/get-standings?tournamentId=${tournamentId}&seasonId=${seasonId}&type=total`,
      {
        headers: {
          "x-rapidapi-host": "sofascore.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    const rows = data.standings?.[0]?.rows;
    if (!rows) throw new Error("No data in response");

    await prisma.$transaction(async (tx) => {
      const existingDictionary = await tx.teamDictionary.findMany({
        include: { translations: true },
      });
      const dictionaryMap = new Map<number, (typeof existingDictionary)[0]>();
      existingDictionary.forEach((item) => {
        dictionaryMap.set(item.sofascoreId, item);
      });
      await tx.standing.deleteMany();

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
          if (ukTranslation) {
            localizedName = ukTranslation.name;
          }
        } else {
          await tx.teamDictionary.create({
            data: {
              sofascoreId: teamId,
              originalName: originalName,
              translations: {
                create: [
                  { language: "uk", name: originalName },
                  { language: "en", name: originalName },
                ],
              },
            },
          });
        }

        insertData.push({
          rank: row.position,
          teamName: localizedName,
          teamLogo: `https://api.sofascore.app/api/v1/team/${row.team.id}/image`,
          points: row.points,
          played: row.matches,
          win: row.wins,
          draw: row.draws,
          lose: row.losses,
          goalsFor: row.scoresFor,
          goalsAgainst: row.scoresAgainst,
          goalsDiff: row.scoresFor - row.scoresAgainst,
          tournamentId: tournament.id,
          seasonId: activeSeason.id,
        });
      }
      await tx.standing.createMany({ data: insertData });
    });

    return NextResponse.json({ success: true, updated: rows.length });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
