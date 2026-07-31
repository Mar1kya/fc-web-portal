import { prisma } from "@/lib/prisma";
import { DataTable, DataTableFilterOption } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";
import { PlayerPosition, TeamContext } from "../../../../../../../../../generated/prisma";

const archiveFilters: DataTableFilterOption[] = [
    {
        columnId: "position",
        placeholder: "Всі позиції",
        options: [
            { value: PlayerPosition.GOALKEEPER, label: "Воротарі" },
            { value: PlayerPosition.DEFENDER, label: "Захисники" },
            { value: PlayerPosition.MIDFIELDER, label: "Півзахисники" },
            { value: PlayerPosition.FORWARD, label: "Нападники" },
        ]
    }
];

export default async function PlayersArchivTableSection({ currentTeam }: { currentTeam: TeamContext }) {
    const archivedPlayers = await prisma.player.findMany({
        where: {
            deletedAt: { not: null },
            teamContext: currentTeam
        },
        orderBy: {
            deletedAt: "desc"
        },
        include: {
            translations: true
        }
    });

    return (
        <DataTable
            columns={archiveColumns}
            data={archivedPlayers}
            searchPlaceholder="Пошук за ім'ям..."
            filters={archiveFilters}
        />
    );
}