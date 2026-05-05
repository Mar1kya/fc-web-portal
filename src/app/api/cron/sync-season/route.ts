import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MatchStatus, TeamContext } from "../../../../../generated/prisma";
import { TEAM_ID } from "@/lib/constants";

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

    if (!activeSeason) {
      return NextResponse.json(
        {
          success: false,
          error: "No active season found in the database. Please create one.",
        },
        { status: 400 },
      );
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
      throw new Error("No matches found in response");
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    await prisma.$transaction(
      async (tx) => {
        for (const event of allMatches) {
          const matchDate = new Date(event.startTimestamp * 1000);

          if (
            matchDate < activeSeason.startDate ||
            matchDate > activeSeason.endDate
          ) {
            skippedCount++;
            continue;
          }

          const isHomeGame = event.homeTeam.id === TEAM_ID;
          const opponentData = isHomeGame ? event.awayTeam : event.homeTeam;

          let tournament = await tx.tournament.findUnique({
            where: { sofascoreId: event.tournament.uniqueTournament.id },
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
          }

          let opponent = await tx.opponent.findUnique({
            where: { sofascoreId: opponentData.id },
          });

          if (!opponent) {
            opponent = await tx.opponent.create({
              data: {
                slug: opponentData.slug,
                sofascoreId: opponentData.id,
                translations: {
                  create: [
                    { language: "uk", name: opponentData.name },
                    { language: "en", name: opponentData.name },
                  ],
                },
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
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    return NextResponse.json({
      success: true,
      processed: allMatches.length,
      skipped: skippedCount,
      created: createdCount,
      updated: updatedCount,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Sync Matches Error:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
