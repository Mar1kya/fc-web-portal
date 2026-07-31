import { prisma } from "@/lib/prisma";
import { TeamContext } from "../../../../../../../generated/prisma";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TeamSwitcher } from "@/components/shared/team-switcher";
import { Suspense } from "react";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import CoachesTableSection from "./_components/coach-table-section";

export const metadata = {
    title: "Керування тренерським штабом",
    description: "Сторінка керування тренерським штабом"
};


export default async function StaffPage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
    const { team } = await searchParams;

    const existingTeamsObj = await prisma.coach.findMany({
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
                    basePath="/admin/team/staff"
                />
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                    <Button variant="outline" asChild className="gap-2">
                        <Link href="/admin/team/staff/archive">
                            <Archive className="w-4 h-4" />
                            Архів
                        </Link>
                    </Button>
                    <Button asChild className="gap-2">
                        <Link href="/admin/team/staff/create">
                            <Plus className="w-4 h-4" /> Додати тренера
                        </Link>
                    </Button>
                </div>
            </div>
            <Suspense key={currentTeam} fallback={<AdminTableSkeleton />}>
                <CoachesTableSection currentTeam={currentTeam} />
            </Suspense>
        </div>
    );
}