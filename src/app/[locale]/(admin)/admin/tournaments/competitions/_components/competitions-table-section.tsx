import { prisma } from "@/lib/prisma";
import { CompetitionsDataTable } from "./competitions-data-table";

export default async function CompetitionsTableSection() {
    const activeSeason = await prisma.season.findFirst({
        where: { isActive: true },
    });

    const tournaments = await prisma.tournament.findMany({
        where: { deletedAt: null },
        include: {
            translations: { where: { language: "uk" } },
            tournamentSeasons: {
                where: activeSeason ? { seasonId: activeSeason.id } : { seasonId: "" },
            },
        },
        orderBy: { hasStandings: "desc" },
    });

    return (
        <CompetitionsDataTable
            data={tournaments}
            activeSeasonId={activeSeason?.id ?? null}
            activeSeasonName={activeSeason?.name ?? null}
        />
    );
}