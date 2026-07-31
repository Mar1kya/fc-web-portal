import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SyncRosterButton } from "./_components/sync-roster-button";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import PlayersTableSection from "./_components/players-table-section";
import { TeamContext } from "../../../../../../../generated/prisma";
import { TeamSwitcher } from "@/components/shared/team-switcher";

export const metadata = {
    title: "Керування командою",
    description: "Сторінка керування командою"
};

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
    const { team } = await searchParams;

    const existingTeamsObj = await prisma.player.findMany({
        where: { deletedAt: null },
        distinct: ['teamContext'],
        select: { teamContext: true },
    });

    const availableTeams = existingTeamsObj.map(t => t.teamContext);

    const currentTeam = team && availableTeams.includes(team as TeamContext)
        ? (team as TeamContext)
        : availableTeams[0] || TeamContext.MAIN_TEAM;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <TeamSwitcher
                    availableTeams={availableTeams}
                    currentTeam={currentTeam}
                    basePath="/admin/team/players"
                />
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                    <Button variant="outline" asChild className="gap-2">
                        <Link href="/admin/team/players/archive">
                            <Archive className="w-4 h-4" />
                            Архів
                        </Link>
                    </Button>
                    <SyncRosterButton />
                    <Button asChild className="gap-2">
                        <Link href="/admin/team/players/create">
                            <Plus className="w-4 h-4" /> Додати гравця
                        </Link>
                    </Button>
                </div>
            </div>
            <Suspense key={currentTeam} fallback={<AdminTableSkeleton  />}>
                <PlayersTableSection currentTeam={currentTeam} />
            </Suspense>
        </div>
    );
}