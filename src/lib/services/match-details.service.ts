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

type SofaIncidentItem = {
  incidentType: string;
  incidentClass?: string;
  isHome: boolean;
  time: number;
  playerIn?: { id: number; name: string };
  playerOut?: { id: number; name: string };
  player?: { id: number; name: string };
  assist1?: { id: number; name: string };
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
      throw new Error(
        `Матч ${matchDbId} не знайдено або відсутній sofascoreId`,
      );
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
    const liveHomeScore: number | null =
      eventDetails?.homeScore?.current ??
      eventDetails?.homeScore?.display ??
      null;
    const liveAwayScore: number | null =
      eventDetails?.awayScore?.current ??
      eventDetails?.awayScore?.display ??
      null;

    const allSofaIdsToFetch = new Set<number>();
    const incidents: SofaIncidentItem[] = incidentsData.incidents || [];
    const isOurHomeGame = match.isHomeGame;

    let ourTeamLineupRaw = null;
    let opponentLineupRaw = null;

    if (lineupsData.home && lineupsData.away) {
      ourTeamLineupRaw = isOurHomeGame ? lineupsData.home : lineupsData.away;
      opponentLineupRaw = isOurHomeGame ? lineupsData.away : lineupsData.home;

      (ourTeamLineupRaw.players as SofaPlayerItem[]).forEach((p) => {
        allSofaIdsToFetch.add(p.player.id);
      });
    }

    incidents.forEach((inc) => {
      if (inc.playerIn?.id) allSofaIdsToFetch.add(inc.playerIn.id);
      if (inc.playerOut?.id) allSofaIdsToFetch.add(inc.playerOut.id);
      if (inc.player?.id) allSofaIdsToFetch.add(inc.player.id);
      if (inc.assist1?.id) allSofaIdsToFetch.add(inc.assist1.id);
    });

    const playersInDb = await prisma.player.findMany({
      where: { sofascoreId: { in: Array.from(allSofaIdsToFetch) } },
      select: { id: true, sofascoreId: true },
    });

    const playerMap = new Map<number, string>();
    playersInDb.forEach((p) => {
      if (p.sofascoreId !== null) {
        playerMap.set(p.sofascoreId, p.id);
      }
    });

    await prisma.$transaction(
      async (tx) => {
        await tx.matchEvent.deleteMany({ where: { matchId: matchDbId } });
        await tx.matchLineup.deleteMany({ where: { matchId: matchDbId } });

        let opponentPlayersJSON: {
          name: string;
          position: string;
          number: string;
          isStarter: boolean;
        }[] = [];

        if (ourTeamLineupRaw && opponentLineupRaw) {
          opponentPlayersJSON = opponentLineupRaw.players.map(
            (p: SofaPlayerItem) => ({
              name: p.player.name,
              position: p.player.position,
              number: p.player.jerseyNumber,
              isStarter: !p.substitute,
            }),
          );

          for (const item of ourTeamLineupRaw.players as SofaPlayerItem[]) {
            const playerDbId = playerMap.get(item.player.id);

            if (playerDbId) {
              await tx.matchLineup.create({
                data: {
                  matchId: matchDbId,
                  playerId: playerDbId,
                  isStarter: !item.substitute,
                  played: !item.substitute,
                },
              });
            }
          }
        } else {
          console.log(`No lineups found for match ${matchDbId}.`);
        }

        for (const incident of incidents) {
          if (incident.incidentType === "substitution") {
            const isOpponentSub = incident.isHome !== match.isHomeGame;

            if (incident.playerIn) {
              const playerInDbId = playerMap.get(incident.playerIn.id) || null;

              if (!isOpponentSub && playerInDbId) {
                await tx.matchLineup.updateMany({
                  where: { matchId: matchDbId, playerId: playerInDbId },
                  data: { played: true },
                });
              }

              await processEvent(
                tx,
                matchDbId,
                EventType.SUBSTITUTION_IN,
                incident.time,
                isOpponentSub ? null : playerInDbId,
                incident.playerIn.name,
                isOpponentSub,
              );
            }

            if (incident.playerOut) {
              const playerOutDbId =
                playerMap.get(incident.playerOut.id) || null;

              await processEvent(
                tx,
                matchDbId,
                EventType.SUBSTITUTION_OUT,
                incident.time,
                isOpponentSub ? null : playerOutDbId,
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

            const playerDbId = incident.player
              ? playerMap.get(incident.player.id) || null
              : null;

            await processEvent(
              tx,
              matchDbId,
              eventType,
              incident.time,
              isOpponentEvent ? null : playerDbId,
              playerName,
              isOpponentEvent,
            );

            if (incident.assist1 && incident.incidentClass !== "ownGoal") {
              const assistDbId = playerMap.get(incident.assist1.id) || null;

              await processEvent(
                tx,
                matchDbId,
                EventType.ASSIST,
                incident.time,
                isOpponentEvent ? null : assistDbId,
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
            const playerDbId = incident.player
              ? playerMap.get(incident.player.id) || null
              : null;

            await processEvent(
              tx,
              matchDbId,
              eventType,
              incident.time,
              isOpponentEvent ? null : playerDbId,
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
            ...(liveHomeScore !== null && { homeScore: liveHomeScore }),
            ...(liveAwayScore !== null && { awayScore: liveAwayScore }),
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 15000,
      },
    );
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
  playerIdDb: string | null,
  customName: string,
  isOpponent: boolean,
) {
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
