import { prisma } from "@/lib/prisma";
import { TeamContext, PlayerPosition } from "../../../../../../../../generated/prisma";
import { DataTable, DataTableFilterOption } from "@/components/ui/data-table";
import { columns } from "./columns";

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

export default async function PlayersTableSection({ currentTeam }: { currentTeam: TeamContext }) {
    const players = await prisma.player.findMany({
        where: {
            deletedAt: null,
            teamContext: currentTeam
        },
        include: { translations: true },
        orderBy: { number: "asc" }
    });

    return (
        <DataTable
            columns={columns}
            data={players}
            searchPlaceholder="Пошук за ім'ям..."
            filters={playerFilters}
        />
    );
}