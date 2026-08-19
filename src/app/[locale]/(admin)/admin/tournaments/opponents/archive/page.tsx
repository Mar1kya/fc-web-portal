import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import AdminTableSkeleton from "../../../_components/admin-table-skeleton";
import OpponentsArchiveTableSection from "./_components/opponents-archive-table-section";
import { prisma } from "@/lib/prisma";
import { TeamContext } from "../../../../../../../../generated/prisma";
import { TeamSwitcher } from "@/components/shared/team-switcher";

export const metadata = {
    title: "Архів суперників",
    description: "Управління архівованими командами-суперниками.",
};

export default async function OpponentsArchivePage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
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
                    <h2 className="text-3xl font-bold tracking-tight">Архів суперників</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються приховані команди. Ви можете відновити їх або очистити базу даних.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/tournaments/opponents">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до списку
                    </Link>
                </Button>
            </div>
            <TeamSwitcher
                availableTeams={availableTeams}
                currentTeam={currentTeam}
                basePath="/admin/tournaments/opponents/archive"
            />
            <Suspense fallback={<AdminTableSkeleton />}>
                <OpponentsArchiveTableSection currentTeam={currentTeam} />
            </Suspense>
        </div>
    );
}