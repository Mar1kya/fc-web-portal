import { MatchEvent, MatchLineup, Player, PlayerPosition } from "../../../generated/prisma";

export type PlayerWithHybridStats = Player & {
    lineupEntries?: (MatchLineup & {
        match?: { homeScore: number | null; awayScore: number | null; isHomeGame: boolean } | null;
    })[];
    events?: MatchEvent[];
};

export function calculateHybridStats(player: PlayerWithHybridStats) {
    const isGoalkeeper = player.position === PlayerPosition.GOALKEEPER;
    const liveMatches = player.lineupEntries?.length || 0;
    const totalMatches = player.initialMatches + liveMatches;
    const liveGoals = player.events?.filter(e => e.type === "GOAL" && !e.isOpponent).length || 0;
    const liveAssists = player.events?.filter(e => e.type === "ASSIST" && !e.isOpponent).length || 0;
    const totalGoals = player.initialGoals + liveGoals;
    const totalAssists = player.initialAssists + liveAssists;

    let liveCleanSheets = 0;
    let liveConceded = 0;

    if (isGoalkeeper && player.lineupEntries) {
        player.lineupEntries.forEach(entry => {
            const match = entry.match;
            if (!match || match.homeScore === null || match.awayScore === null) return;

            const opponentGoals = match.isHomeGame ? match.awayScore : match.homeScore;

            liveConceded += opponentGoals;
            
            if (opponentGoals === 0) {
                liveCleanSheets += 1;
            }
        });
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