import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { TeamContext } from "../../../../../../../../generated/prisma"
import AdminTableSkeleton from "../../../_components/admin-table-skeleton"
import CoachesArchivTableSection from "./_components/coach-archive-table-section"
import { Suspense } from "react"
import { TeamSwitcher } from "@/components/shared/team-switcher"

export const metadata: Metadata = {
    title: "Архів персоналу",
    description: "Управління видаленими профілями тренерського штабу."
}

export default async function StaffArchivePage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
    const { team } = await searchParams;

    const existingTeamsObj = await prisma.coach.findMany({
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
                    <h2 className="text-3xl font-bold tracking-tight">Архів персоналу</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються видалені профілі тренерського штабу. Ви можете відновити їх або очистити базу.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/team/staff">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до складу
                    </Link>
                </Button>
            </div>
            <TeamSwitcher
                availableTeams={availableTeams}
                currentTeam={currentTeam}
                basePath="/admin/team/staff/archive"
            />
            <Suspense key={currentTeam} fallback={<AdminTableSkeleton />}>
                <CoachesArchivTableSection currentTeam={currentTeam} />
            </Suspense>
        </div>
    )
}