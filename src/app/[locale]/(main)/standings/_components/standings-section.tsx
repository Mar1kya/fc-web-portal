import { prisma } from "@/lib/prisma";
import StandingsTable from "./standings-table";

export default async function StandingsSection({
    tournamentId,
    seasonId
}: {
    tournamentId: string;
    seasonId: string;
}) {
    const [standings, dictionaries] = await Promise.all([
        prisma.standing.findMany({
            where: {
                tournamentId: tournamentId,
                seasonId: seasonId,
            },
            orderBy: { rank: "asc" },
        }),
        prisma.teamDictionary.findMany({
            include: { translations: true },
        })
    ]);

    return (
        <StandingsTable
            standings={standings}
            dictionaries={dictionaries}
        />
    );
}