import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";
import { Suspense } from "react";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import OpponentsTableSection from "./_components/opponents-table-section";
import { TeamContext } from "../../../../../../../generated/prisma";
import { prisma } from "@/lib/prisma";
import { TeamSwitcher } from "@/components/shared/team-switcher";

export const metadata = {
    title: "Суперники",
    description: "Управління списком команд-суперників",
};

export default async function OpponentsPage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
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
                    <h2 className="text-3xl font-bold tracking-tight">Суперники</h2>
                    <p className="text-muted-foreground mt-1">
                        База команд-суперників для формування розкладу матчів.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/tournaments/opponents/archive">
                            <Archive className="w-4 h-4" />
                            Архів
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/tournaments/opponents/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Додати суперника
                        </Link>
                    </Button>
                </div>
            </div>
            <TeamSwitcher
                availableTeams={availableTeams}
                currentTeam={currentTeam}
                basePath="/admin/tournaments/opponents"
            />
            <Suspense fallback={<AdminTableSkeleton />}>
                <OpponentsTableSection currentTeam={currentTeam} />
            </Suspense>
        </div>
    );
}