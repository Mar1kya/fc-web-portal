import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PlayerPosition, TeamContext } from "../../../../../generated/prisma";
import { TEAM_ID } from "@/lib/constants";

const mapPosition = (positionCode: string): PlayerPosition => {
  switch (positionCode) {
    case "G":
      return PlayerPosition.GOALKEEPER;
    case "D":
      return PlayerPosition.DEFENDER;
    case "M":
      return PlayerPosition.MIDFIELDER;
    case "F":
      return PlayerPosition.FORWARD;
    default:
      return PlayerPosition.MIDFIELDER;
  }
};

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

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
    const response = await fetch(
      `https://sofascore.p.rapidapi.com/teams/get-squad?teamId=${TEAM_ID}`,
      {
        headers: {
          "x-rapidapi-host": "sofascore.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) throw new Error("API error fetching squad");

    const data = await response.json();
    const playersData = data.players || [];

    if (playersData.length === 0) {
      throw new Error("No players found in response");
    }

    let createdCount = 0;
    let updatedCount = 0;

    await prisma.$transaction(
      async (tx) => {
        for (const item of playersData) {
          const playerData = item.player;
          const sofascoreId = playerData.id;
          const name = playerData.name;
          const position = mapPosition(playerData.position);
          const number = Number(playerData.jerseyNumber) || 0;
          const height = playerData.height || null;
          const birthDate = playerData.dateOfBirthTimestamp
            ? new Date(playerData.dateOfBirthTimestamp * 1000)
            : null;
          const nationality = playerData.country?.alpha3 || null;
          const avatar = `https://api.sofascore.app/api/v1/player/${sofascoreId}/image`;
          const slug = generateSlug(`${name}-${number}`);

          const existingPlayer = await tx.player.findUnique({
            where: { sofascoreId },
          });

          if (existingPlayer) {
            await tx.player.update({
              where: { id: existingPlayer.id },
              data: {
                number,
                position,
                height,
                birthDate,
                nationality,
                avatar,
              },
            });
            updatedCount++;
          } else {
            await tx.player.create({
              data: {
                slug,
                sofascoreId,
                number,
                position,
                height,
                birthDate,
                nationality,
                avatar,
                teamContext: TeamContext.MAIN_TEAM,
                translations: {
                  create: [
                    { language: "uk", name: name },
                    { language: "en", name: name },
                  ],
                },
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
      created: createdCount,
      updated: updatedCount,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Sync Roster Error:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
