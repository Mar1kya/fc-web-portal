import {
    EventType,
    MatchEvent,
    MatchLineup,
    Player,
    PlayerPosition,
} from "../../../generated/prisma";

type MatchEventSnapshot = Pick<MatchEvent, "type" | "minute" | "isOpponent">;

type MatchContext = {
    id: string;
    isHomeGame: boolean;
    events?: MatchEventSnapshot[];
};

export type PlayerWithHybridStats = Player & {
    lineupEntries?: (MatchLineup & {
        match?: MatchContext | null;
    })[];
    events?: MatchEvent[];
};

export function calculateHybridStats(player: PlayerWithHybridStats) {
    const isGoalkeeper = player.position === PlayerPosition.GOALKEEPER;
    const playedEntries = player.lineupEntries?.filter((entry) => entry.played) ?? [];
    const liveMatches = playedEntries.length;
    const totalMatches = player.initialMatches + liveMatches;

    const liveGoals =
        player.events?.filter((e) => e.type === EventType.GOAL && !e.isOpponent).length ?? 0;
    const liveAssists =
        player.events?.filter((e) => e.type === EventType.ASSIST && !e.isOpponent).length ?? 0;
    const totalGoals = player.initialGoals + liveGoals;
    const totalAssists = player.initialAssists + liveAssists;

    let liveCleanSheets = 0;
    let liveConceded = 0;

    if (isGoalkeeper) {
        for (const entry of playedEntries) {
            const match = entry.match;
            if (!match) continue;

            const playerMatchEvents =
                player.events?.filter((e) => e.matchId === match.id) ?? [];

            const subInMinute = playerMatchEvents.find(
                (e) => e.type === EventType.SUBSTITUTION_IN
            )?.minute;

            const subOutMinute = playerMatchEvents.find(
                (e) => e.type === EventType.SUBSTITUTION_OUT
            )?.minute;

            const minuteEntered: number | null = entry.isStarter ? 0 : (subInMinute ?? null);
            const minuteLeft = subOutMinute ?? Infinity;
            if (minuteEntered === null) continue; 
            const goalsConceded = (match.events ?? []).filter(
                (e) =>
                    e.type === EventType.GOAL &&
                    e.isOpponent &&
                    e.minute > minuteEntered &&
                    e.minute <= minuteLeft
            ).length;

            liveConceded += goalsConceded;
            if (goalsConceded === 0) liveCleanSheets++;
        }
    }

    const totalCleanSheets = player.initialCleanSheets + liveCleanSheets;
    const totalConceded = player.initialGoalsConceded + liveConceded;

    return {
        matches: totalMatches,
        goals: totalGoals,
        assists: totalAssists,
        cleanSheets: totalCleanSheets,
        conceded: totalConceded,
    };
}