import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { archiveColumns } from "./_components/archive-columns"

export const metadata = {
    title: "Архів сезонів",
    description: "Управління архівованими сезонами."
}

export default async function SeasonsArchivePage() {
    const archivedSeasons = await prisma.season.findMany({
        where: {
            deletedAt: { not: null }
        },
        orderBy: {
            deletedAt: "desc"
        }
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Архів сезонів</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються видалені сезони. Ви можете відновити їх або очистити базу.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/tournaments/seasons">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до списку сезонів
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <DataTable
                    columns={archiveColumns}
                    data={archivedSeasons}
                    searchPlaceholder="Пошук за назвою сезону..."
                />
            </div>
        </div>
    )
}