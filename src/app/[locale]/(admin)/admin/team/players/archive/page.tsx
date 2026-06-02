import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DataTable, DataTableFilterOption } from "@/components/ui/data-table"
import { PlayerPosition } from "../../../../../../../../generated/prisma"
import { archiveColumns } from "./_components/archive-columns"

export const metadata: Metadata = {
    title: "Архів гравців",
    description: "Управління видаленими профілями гравців."
}

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

export default async function PlayersArchivePage() {
    const archivedPlayers = await prisma.player.findMany({
        where: {
            deletedAt: { not: null }
        },
        orderBy: {
            deletedAt: "desc"
        },
        include: {
            translations: true
        }
    });

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
            <div className="mt-4">
                <DataTable 
                    columns={archiveColumns} 
                    data={archivedPlayers} 
                    searchPlaceholder="Пошук за ім'ям..."
                    filters={archiveFilters}
                />
            </div>
        </div>
    )
}