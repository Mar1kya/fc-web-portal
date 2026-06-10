import { prisma } from "@/lib/prisma";
import { PlayerPosition, TeamContext } from "../../../../../../../generated/prisma";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DataTable, DataTableFilterOption } from "@/components/ui/data-table";
import { columns } from "./_components/columns";
import { SyncRosterButton } from "./_components/sync-roster-button";

const teamTranslations: Record<TeamContext, string> = {
    MAIN_TEAM: "Основна команда",
    U19: "U-19",
    ACADEMY: "Академія",
    GENERAL: "Загальний склад",
};
const playerFilters: DataTableFilterOption[] = [
    {
        columnId: "position",
        placeholder: "Всі позиція",
        options: [
            { value: PlayerPosition.GOALKEEPER, label: "Воротарі" },
            { value: PlayerPosition.DEFENDER, label: "Захисники" },
            { value: PlayerPosition.MIDFIELDER, label: "Півзахисники" },
            { value: PlayerPosition.FORWARD, label: "Нападники" },
        ]
    }
];

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

    const players = await prisma.player.findMany({
        where: {
            deletedAt: null,
            teamContext: currentTeam
        },
        include: { translations: true },
        orderBy: { number: "asc" }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full md:w-auto">
                    {availableTeams.length > 0 ? (
                        availableTeams.map((teamEnum) => {
                            const isActive = currentTeam === teamEnum;
                            return (
                                <Link
                                    key={teamEnum}
                                    href={`/admin/team/players?team=${teamEnum}`}
                                >
                                    <Button
                                        variant={isActive ? "default" : "outline"}
                                        className={isActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                                    >
                                        {teamTranslations[teamEnum] || teamEnum}
                                    </Button>
                                </Link>
                            )
                        })
                    ) : (
                        <Button>
                            Основна команда
                        </Button>
                    )}
                </div>
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
            <DataTable
                columns={columns}
                data={players}
                searchPlaceholder="Пошук за ім'ям..."
                filters={playerFilters}
            />
        </div>
    );
}