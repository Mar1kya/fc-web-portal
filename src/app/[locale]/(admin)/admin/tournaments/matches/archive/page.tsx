import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TeamContext } from "../../../../../../../../generated/prisma";
import { TeamSwitcher } from "@/components/shared/team-switcher";
import { Suspense } from "react";
import AdminTableSkeleton from "../../../_components/admin-table-skeleton";
import MatchesArchiveTableSection from "./_components/matches-archive-table-section";

export const metadata = {
    title: "Архів матчів",
    description: "Управління видаленими матчами",
};

export default async function MatchesArchivePage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
    const { team } = await searchParams;

    const existingTeamsObj = await prisma.match.findMany({
        where: { deletedAt: { not: null } },
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
                    <h2 className="text-3xl font-bold tracking-tight">Архів матчів</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються видалені ігри. Ви можете відновити їх або остаточно очистити.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/tournaments/matches">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до розкладу
                    </Link>
                </Button>
            </div>
            <TeamSwitcher
                availableTeams={availableTeams}
                currentTeam={currentTeam}
                basePath="/admin/tournaments/matches/archive"
            />
            <Suspense key={currentTeam} fallback={<AdminTableSkeleton />}>
                <MatchesArchiveTableSection currentTeam={currentTeam} />
            </Suspense>
        </div>
    );
}