import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";
import { TeamContext } from "../../../../../../../generated/prisma";
import { SyncScheduleButton } from "./_components/sync-schedule-button";
import { TeamSwitcher } from "@/components/shared/team-switcher";
import { Suspense } from "react";
import MatchesTableSection from "./_components/matches-table-section";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";

export const metadata = {
    title: "Матчі",
    description: "Управління розкладом та результатами матчів",
};

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
    const { team } = await searchParams;

    const existingTeamsObj = await prisma.match.findMany({
        where: { deletedAt: null },
        distinct: ['teamContext'],
        select: { teamContext: true },
    });

    const availableTeams = existingTeamsObj.map(t => t.teamContext);

    const currentTeam = team && availableTeams.includes(team as TeamContext)
        ? (team as TeamContext)
        : availableTeams[0] || TeamContext.MAIN_TEAM;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Матч-центр</h2>
                    <p className="text-muted-foreground mt-1">
                        Керуйте розкладом матчів. Основні ігри підтягуються з SofaScore автоматично.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <SyncScheduleButton />
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
            <TeamSwitcher
                availableTeams={availableTeams}
                currentTeam={currentTeam}
                basePath="/admin/tournaments/matches"
            />
            <Suspense key={currentTeam} fallback={<AdminTableSkeleton />}>
                <MatchesTableSection currentTeam={currentTeam} />
            </Suspense>
        </div>
    );
}