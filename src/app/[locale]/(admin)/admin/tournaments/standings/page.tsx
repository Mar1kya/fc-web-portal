import { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { StandingsControls } from "./_components/standings-controls";
import StandingsTableSection from "./_components/standings-table-section";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import { getTranslation } from "@/lib/utils/get-translation";

export const metadata: Metadata = {
    title: "Турнірні таблиці",
};

export default async function StandingsPage({ searchParams }: { searchParams: Promise<{ seasonId?: string, tournamentId?: string }> }) {
    const params = await searchParams;

    const seasons = await prisma.season.findMany({ where: { deletedAt: null }, orderBy: { startDate: "desc" } });
    const rawTournaments = await prisma.tournament.findMany({ where: { deletedAt: null, hasStandings: true }, include: { translations: true } });

    const tournaments = rawTournaments.map(t => ({
        id: t.id,
        slug: t.slug,
        name: getTranslation(t, "uk")?.name || t.slug
    }));

    const activeSeason = seasons.find(s => s.isActive) || seasons[0];
    const currentSeasonId = params.seasonId || (activeSeason?.id || "");
    const currentTournamentId = params.tournamentId || (tournaments[0]?.id || "");

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Турнірні таблиці</h2>
                <p className="text-muted-foreground mt-1">
                    Перегляд та примусове оновлення турнірних таблиць зі стороннього API.
                </p>
            </div>
            <div className="mt-2 space-y-4">
                <StandingsControls
                    seasons={seasons}
                    tournaments={tournaments}
                    currentSeasonId={currentSeasonId}
                    currentTournamentId={currentTournamentId}
                />
                <Suspense
                    key={`${currentSeasonId}-${currentTournamentId}`}
                    fallback={<AdminTableSkeleton columns={10} />}
                >
                    <StandingsTableSection
                        seasonId={currentSeasonId}
                        tournamentId={currentTournamentId}
                    />
                </Suspense>
            </div>
        </div>
    );
}