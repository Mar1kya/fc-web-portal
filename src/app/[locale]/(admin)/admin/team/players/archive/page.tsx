import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import PlayersArchivTableSection from "./_components/players-archive-table-section"
import AdminTableSkeleton from "../../../_components/admin-table-skeleton"
import { TeamContext } from "../../../../../../../../generated/prisma"
import { TeamSwitcher } from "@/components/shared/team-switcher"

export const metadata: Metadata = {
    title: "Архів гравців",
    description: "Управління видаленими профілями гравців."
}

export default async function PlayersArchivePage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
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
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Архів гравців</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються видалені профілі гравців. Ви можете відновити їх або очистити базу.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/team/players">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до ростеру
                    </Link>
                </Button>
            </div>
            <TeamSwitcher
                availableTeams={availableTeams}
                currentTeam={currentTeam}
                basePath="/admin/team/players/archive"
            />
            <Suspense key={currentTeam} fallback={<AdminTableSkeleton />}>
                <PlayersArchivTableSection currentTeam={currentTeam} />
            </Suspense>
        </div>
    )
}