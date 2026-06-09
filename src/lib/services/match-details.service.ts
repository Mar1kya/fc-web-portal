import { prisma } from "@/lib/prisma";
import { Prisma, EventType } from "../../../generated/prisma";

type SofaPlayerItem = {
  substitute: boolean;
  player: {
    id: number;
    name: string;
    position: string;
    jerseyNumber: string;
  };
};

async function fetchSofaMatchDetails(
  sofascoreId: number,
  endpointPath: string,
) {
  const response = await fetch(
    `https://sofascore.p.rapidapi.com/matches/${endpointPath}?matchId=${sofascoreId}`,
    {
      headers: {
        "x-rapidapi-host": "sofascore.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) return null;
  return response.json();
}

export async function processMatchSync(matchDbId: string) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchDbId },
    });

    if (!match || !match.sofascoreId) {
      throw new Error(`Match ${matchDbId} not found or missing sofascoreId`);
    }

    const [lineupsData, incidentsData, defaultData] = await Promise.all([
      fetchSofaMatchDetails(match.sofascoreId, "get-lineups"),
      fetchSofaMatchDetails(match.sofascoreId, "get-incidents"),
      fetchSofaMatchDetails(match.sofascoreId, "detail"),
    ]);

    if (!lineupsData || !incidentsData || !defaultData) {
      throw new Error("Failed to fetch data from SofaScore API");
    }

    const eventDetails = defaultData.event;
    const stadiumName =
      eventDetails?.venue?.stadium?.name || eventDetails?.venue?.name || null;
    const homeCoach = eventDetails?.homeTeam?.manager?.name || null;
    const awayCoach = eventDetails?.awayTeam?.manager?.name || null;

    await prisma.$transaction(async (tx) => {
      await tx.matchEvent.deleteMany({ where: { matchId: matchDbId } });
      await tx.matchLineup.deleteMany({ where: { matchId: matchDbId } });

      let opponentPlayersJSON: {
        name: string;
        position: string;
        number: string;
        isStarter: boolean;
      }[] = [];

      if (lineupsData.home && lineupsData.away) {
        const { home, away } = lineupsData;
        const isPolissyaHome = match.isHomeGame;

        const polissyaLineup = isPolissyaHome ? home : away;
        const opponentLineupRaw = isPolissyaHome ? away : home;

        opponentPlayersJSON = opponentLineupRaw.players.map(
          (p: SofaPlayerItem) => ({
            name: p.player.name,
            position: p.player.position,
            number: p.player.jerseyNumber,
            isStarter: !p.substitute,
          }),
        );

        for (const item of polissyaLineup.players as SofaPlayerItem[]) {
          const playerInDb = await tx.player.findUnique({
            where: { sofascoreId: item.player.id },
          });

          if (playerInDb) {
            await tx.matchLineup.create({
              data: {
                matchId: matchDbId,
                playerId: playerInDb.id,
                isStarter: !item.substitute,
                played: true,
              },
            });
          }
        }
      } else {
        console.log(`No lineups found for match ${match.slug}.`);
      }

      const incidents = incidentsData.incidents || [];

      for (const incident of incidents) {
        if (incident.incidentType === "substitution") {
          const isOpponentSub = incident.isHome !== match.isHomeGame;
          if (incident.playerIn) {
            await processEvent(
              tx,
              matchDbId,
              EventType.SUBSTITUTION_IN,
              incident.time,
              incident.playerIn.id,
              incident.playerIn.name,
              isOpponentSub,
            );
          }
          if (incident.playerOut) {
            await processEvent(
              tx,
              matchDbId,
              EventType.SUBSTITUTION_OUT,
              incident.time,
              incident.playerOut.id,
              incident.playerOut.name,
              isOpponentSub,
            );
          }
          continue;
        }

        let eventType: EventType | null = null;
        let isOpponentEvent = incident.isHome !== match.isHomeGame;
        let playerName = incident.player?.name || "";

        if (incident.incidentType === "goal") {
          eventType = EventType.GOAL;

          if (incident.incidentClass === "ownGoal") {
            playerName += " (OG)";
            isOpponentEvent = !isOpponentEvent;
          } else if (incident.incidentClass === "penalty") {
            playerName += " (Pen.)";
          }

          await processEvent(
            tx,
            matchDbId,
            eventType,
            incident.time,
            incident.player?.id,
            playerName,
            isOpponentEvent,
          );

          if (incident.assist1 && incident.incidentClass !== "ownGoal") {
            await processEvent(
              tx,
              matchDbId,
              EventType.ASSIST,
              incident.time,
              incident.assist1.id,
              incident.assist1.name,
              isOpponentEvent,
            );
          }
          continue;
        } else if (incident.incidentClass === "yellow") {
          eventType = EventType.YELLOW_CARD;
        } else if (incident.incidentClass === "red") {
          eventType = EventType.RED_CARD;
        }

        if (eventType) {
          await processEvent(
            tx,
            matchDbId,
            eventType,
            incident.time,
            incident.player?.id,
            playerName,
            isOpponentEvent,
          );
        }
      }

      await tx.match.update({
        where: { id: matchDbId },
        data: {
          isDetailsSynced: true,
          opponentLineup: opponentPlayersJSON,
          stadium: stadiumName,
          homeCoachName: homeCoach,
          awayCoachName: awayCoach,
        },
      });
    });

    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Match sync failed for ${matchDbId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

async function processEvent(
  tx: Prisma.TransactionClient,
  matchId: string,
  type: EventType,
  minute: number,
  playerSofaId: number | undefined,
  customName: string,
  isOpponent: boolean,
) {
  let playerIdDb: string | null = null;

  if (!isOpponent && playerSofaId) {
    const playerInDb = await tx.player.findUnique({
      where: { sofascoreId: playerSofaId },
    });
    if (playerInDb) playerIdDb = playerInDb.id;
  }

  await tx.matchEvent.create({
    data: {
      matchId,
      type,
      minute,
      isOpponent,
      playerId: playerIdDb,
      customPlayerName:
        !playerIdDb || customName.includes("(") ? customName : null,
    },
  });
}
