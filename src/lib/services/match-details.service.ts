import { prisma } from "@/lib/prisma";
import { Prisma, EventType, PlayerPosition, TeamContext } from "../../../generated/prisma";
import { generatePlayerSlug } from "@/lib/utils/slugify";
import {
  mapSofaPosition,
  sofaAvatarUrl,
  sofaBirthDate,
  sofaJerseyNumberToInt,
  SofaRawPlayer,
} from "@/lib/utils/sofascore";

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

async function fetchSofaPlayerProfile(
  playerId: number,
): Promise<SofaRawPlayer | null> {
  try {
    const response = await fetch(
      `https://sofascore.p.rapidapi.com/players/get-info?playerId=${playerId}`,
      {
        headers: {
          "x-rapidapi-host": "sofascore.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return null;
    const data = await response.json();
    const p = data?.player;
    if (!p) return null;

    return {
      id: p.id,
      name: p.name,
      position: p.position ?? null,
      jerseyNumber: p.jerseyNumber ?? null,
      height: p.height ?? null,
      dateOfBirthTimestamp: p.dateOfBirthTimestamp ?? null,
      country: p.country ?? null,
    };
  } catch (err) {
    console.error(`Не вдалося отримати профіль гравця ${playerId}:`, err);
    return null;
  }
}

function slugifyPlayerName(name: string, number: number): string {
  return generatePlayerSlug(name, number);
}

async function generateUniquePlayerSlug(
  tx: Prisma.TransactionClient,
  name: string,
  number: number,
): Promise<string> {
  const base = slugifyPlayerName(name, number);
  let candidate = base;
  let attempt = 1;

  while (true) {
    const existing = await tx.player.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
}

async function ensurePlayerExists(
  tx: Prisma.TransactionClient,
  sofaPlayer: SofaRawPlayer,
  matchTeamContext: TeamContext,
): Promise<string | null> {
  const existing = await tx.player.findUnique({
    where: { sofascoreId: sofaPlayer.id },
    select: { id: true, number: true, position: true, isManualAvatar: true, avatar: true },
  });

  const jerseyNumber = sofaJerseyNumberToInt(sofaPlayer.jerseyNumber);
  const position = sofaPlayer.position
    ? mapSofaPosition(sofaPlayer.position)
    : null;

  if (existing) {
    const patch: Prisma.PlayerUpdateInput = {};

    if (jerseyNumber !== null && jerseyNumber !== existing.number) {
      patch.number = jerseyNumber;
    }
    if (position !== null && position !== existing.position) {
      patch.position = position;
    }

    if (Object.keys(patch).length > 0) {
      await tx.player.update({ where: { id: existing.id }, data: patch });
    }

    return existing.id;
  }

  let enriched = sofaPlayer;
  if (jerseyNumber === null || !sofaPlayer.position) {
    const fetched = await fetchSofaPlayerProfile(sofaPlayer.id);
    if (fetched) enriched = { ...fetched, name: sofaPlayer.name || fetched.name };
  }

  const finalNumber = sofaJerseyNumberToInt(enriched.jerseyNumber) ?? 0;
  const finalPosition = mapSofaPosition(enriched.position);
  const slug = await generateUniquePlayerSlug(tx, enriched.name, finalNumber);

  try {
    const created = await tx.player.create({
      data: {
        slug,
        sofascoreId: sofaPlayer.id,
        number: finalNumber,
        position: finalPosition,
        teamContext: matchTeamContext,
        height: enriched.height ?? null,
        birthDate: sofaBirthDate(enriched.dateOfBirthTimestamp),
        nationality: enriched.country?.alpha3 ?? null,
        avatar: sofaAvatarUrl(sofaPlayer.id),
        translations: {
          create: [{ language: "uk", name: sofaPlayer.name }],
        },
      },
      select: { id: true },
    });
    return created.id;
  } catch (err) {
    console.error(
      `Не вдалося автостворити гравця ${sofaPlayer.name} (${sofaPlayer.id}):`,
      err,
    );
    return null;
  }
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

    const incidents: SofaIncidentItem[] = incidentsData.incidents || [];
    const isOurHomeGame = match.isHomeGame;

    let ourTeamLineupRaw = null;
    let opponentLineupRaw = null;

    const ourSofaPlayersById = new Map<number, SofaRawPlayer>();

    if (lineupsData.home && lineupsData.away) {
      ourTeamLineupRaw = isOurHomeGame ? lineupsData.home : lineupsData.away;
      opponentLineupRaw = isOurHomeGame ? lineupsData.away : lineupsData.home;

      (ourTeamLineupRaw.players as SofaPlayerItem[]).forEach((p) => {
        ourSofaPlayersById.set(p.player.id, p.player);
      });
    }

    incidents.forEach((inc) => {
      const isOpponentIncident = inc.isHome !== match.isHomeGame;
      if (isOpponentIncident) return;

      const addIfMissing = (player: { id: number; name: string } | undefined) => {
        if (!player) return;
        if (ourSofaPlayersById.has(player.id)) return; 
        ourSofaPlayersById.set(player.id, {
          id: player.id,
          name: player.name,
          position: null,
          jerseyNumber: null,
        });
      };

      addIfMissing(inc.playerIn);
      addIfMissing(inc.playerOut);
      addIfMissing(inc.player);
      addIfMissing(inc.assist1);
    });

    await prisma.$transaction(
      async (tx) => {
        await tx.matchEvent.deleteMany({ where: { matchId: matchDbId } });
        await tx.matchLineup.deleteMany({ where: { matchId: matchDbId } });

        const playerMap = new Map<number, string>();
        for (const sofaPlayer of ourSofaPlayersById.values()) {
          const dbId = await ensurePlayerExists(
            tx,
            sofaPlayer,
            match.teamContext,
          );
          if (dbId) playerMap.set(sofaPlayer.id, dbId);
        }

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
              await tx.matchLineup.upsert({
                where: {
                  matchId_playerId: { matchId: matchDbId, playerId: playerDbId },
                },
                create: {
                  matchId: matchDbId,
                  playerId: playerDbId,
                  isStarter: !item.substitute,
                  played: !item.substitute,
                },
                update: {
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
        timeout: 20000,
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
      customPlayerName: playerIdDb ? null : customName,
    },
  });
}