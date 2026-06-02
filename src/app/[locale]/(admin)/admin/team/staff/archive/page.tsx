import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { archiveColumns } from "./_components/archive-columns"

export const metadata: Metadata = {
    title: "Архів персоналу",
    description: "Управління видаленими профілями тренерського штабу."
}

export default async function StaffArchivePage() {
    const archivedCoaches = await prisma.coach.findMany({
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
            <div className="mt-4">
                <DataTable 
                    columns={archiveColumns} 
                    data={archivedCoaches} 
                    searchPlaceholder="Пошук за ім'ям..."
                />
            </div>
        </div>
    )
}