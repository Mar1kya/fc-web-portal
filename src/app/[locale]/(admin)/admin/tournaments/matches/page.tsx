import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TeamContext } from "../../../../../../../generated/prisma";
import { SyncScheduleButton } from "./_components/sync-schedule-button";
import { TeamSwitcher } from "@/components/shared/team-switcher";
import { Suspense } from "react";
import MatchesTableSection from "./_components/matches-table-section";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import { SeasonFilter } from "./_components/season-filter";

export const metadata = {
    title: "Матчі",
    description: "Управління розкладом та результатами матчів",
};

const EXCLUDED_TEAM_CONTEXTS: TeamContext[] = [TeamContext.GENERAL];

export default async function MatchesPage({
    searchParams,
}: {
    searchParams: Promise<{ team?: string; season?: string }>;
}) {
    const { team, season } = await searchParams;

    const availableTeams = Object.values(TeamContext).filter(
        (context) => !EXCLUDED_TEAM_CONTEXTS.includes(context)
    );

    const currentTeam = team && availableTeams.includes(team as TeamContext)
        ? (team as TeamContext)
        : availableTeams[0] || TeamContext.MAIN_TEAM;

    const seasons = await prisma.season.findMany({
        where: { deletedAt: null },
        orderBy: { startDate: "desc" },
        select: { id: true, name: true, isActive: true },
    });

    const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0] ?? null;

    const currentSeasonId = season && seasons.some((s) => s.id === season)
        ? season
        : activeSeason?.id;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Матч-центр</h2>
                    <p className="text-muted-foreground mt-1">
                        Керуйте розкладом матчів. Основні ігри підтягуються з SofaScore автоматично.
                    </p>
                </div>
                <div className="flex items-center justify-center  sm:justify-end flex-wrap gap-2">
                    <SyncScheduleButton teamContext={currentTeam} />
                    <Button variant="outline" asChild>
                        <Link href="/admin/tournaments/matches/archive">
                            <Archive className="mr-2 h-4 w-4" />
                            Архів
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/tournaments/matches/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Ручний матч
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <TeamSwitcher
                    availableTeams={availableTeams}
                    currentTeam={currentTeam}
                    basePath="/admin/tournaments/matches"
                />
                <SeasonFilter
                    seasons={seasons}
                    currentSeasonId={currentSeasonId}
                />
            </div>
            <Suspense key={`${currentTeam}-${currentSeasonId}`} fallback={<AdminTableSkeleton />}>
                <MatchesTableSection currentTeam={currentTeam} seasonId={currentSeasonId} />
            </Suspense>
        </div>
    );
}