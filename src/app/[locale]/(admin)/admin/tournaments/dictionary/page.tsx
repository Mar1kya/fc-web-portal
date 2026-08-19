import { Metadata } from "next";
import { Suspense } from "react";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import DictionaryTableSection from "./_components/dictionary-table-section";
import { prisma } from "@/lib/prisma";
import { TeamContext } from "../../../../../../../generated/prisma";
import { TeamSwitcher } from "@/components/shared/team-switcher";

export const metadata: Metadata = {
    title: "Словник команд",
    description: "Управління словником команд."

};

export default async function DictionaryPage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
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
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Словник команд</h2>
                <p className="text-muted-foreground mt-1">
                    Управління перекладами команд, які автоматично завантажуються зі стороннього API (SofaScore).
                </p>
            </div>
            <TeamSwitcher
                availableTeams={availableTeams}
                currentTeam={currentTeam}
                basePath="/admin/tournaments/dictionary"
            />
            <Suspense fallback={<AdminTableSkeleton />}>
                <DictionaryTableSection currentTeam={currentTeam} />
            </Suspense>
        </div>
    );
}