import {
    EventType,
    MatchEvent,
    MatchLineup,
    Player,
    PlayerPosition,
    TeamContext,
} from "../../../generated/prisma";

type MatchEventSnapshot = Pick<MatchEvent, "type" | "minute" | "isOpponent">;

type MatchContext = {
    id: string;
    isHomeGame: boolean;
    teamContext?: TeamContext;
    events?: MatchEventSnapshot[];
};

export type PlayerWithHybridStats = Player & {
    lineupEntries?: (MatchLineup & {
        match?: MatchContext | null;
    })[];
    events?: (MatchEvent & {
        match?: Pick<MatchContext, "teamContext"> | null;
    })[];
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

export type ContextStatsEntry = {
    teamContext: TeamContext;
    matches: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    conceded: number;
};

export function calculateStatsByContext(player: PlayerWithHybridStats): ContextStatsEntry[] {
    const isGoalkeeper = player.position === PlayerPosition.GOALKEEPER;
    const playedEntries = player.lineupEntries?.filter(
        (entry) => entry.played && entry.match?.teamContext
    ) ?? [];

    type PlayedEntry = PlayerWithHybridStats["lineupEntries"] extends (infer T)[] | undefined
        ? T
        : never;

    const byContext = new Map<TeamContext, PlayedEntry[]>();
    for (const entry of playedEntries) {
        const ctx = entry.match!.teamContext!;
        const list = byContext.get(ctx) ?? [];
        list.push(entry);
        byContext.set(ctx, list);
    }

    const result: ContextStatsEntry[] = [];

    for (const [teamContext, entries] of byContext) {
        const matchIds = new Set(entries.map((e) => e.match!.id));

        const contextEvents =
            player.events?.filter((e) => matchIds.has(e.matchId)) ?? [];

        const goals = contextEvents.filter(
            (e) => e.type === EventType.GOAL && !e.isOpponent
        ).length;
        const assists = contextEvents.filter(
            (e) => e.type === EventType.ASSIST && !e.isOpponent
        ).length;

        let cleanSheets = 0;
        let conceded = 0;

        if (isGoalkeeper) {
            for (const entry of entries) {
                const match = entry.match;
                if (!match) continue;

                const playerMatchEvents = contextEvents.filter(
                    (e) => e.matchId === match.id
                );

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

                conceded += goalsConceded;
                if (goalsConceded === 0) cleanSheets++;
            }
        }

        result.push({
            teamContext,
            matches: entries.length,
            goals,
            assists,
            cleanSheets,
            conceded,
        });
    }

    return result.sort((a, b) => {
        if (a.teamContext === TeamContext.MAIN_TEAM) return -1;
        if (b.teamContext === TeamContext.MAIN_TEAM) return 1;
        return b.matches - a.matches;
    });
}