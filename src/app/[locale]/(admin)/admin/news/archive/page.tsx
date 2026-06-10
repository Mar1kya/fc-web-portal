import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { trashColumns } from "./_components/archive-columns"
import { DataTable, DataTableFilterOption } from "@/components/ui/data-table"
import { postTypeTranslations, teamContextTranslations } from "@/lib/constants"

export const metadata: Metadata = {
    title: "Кошик новин",
    description: "Управління видаленими публікаціями."
}

const trashFilters: DataTableFilterOption[] = [
    {
        columnId: "teamContext", 
        placeholder: "Всі команди",
        options: Object.entries(teamContextTranslations).map(([value, label]) => ({
            value,
            label,
        })),
    },
    {
        columnId: "type",
        placeholder: "Всі категорії",
        options: Object.entries(postTypeTranslations).map(([value, label]) => ({
            value,
            label,
        })),
    },
];

export default async function ArchivePage() {
    const trashedPosts = await prisma.post.findMany({
        where: {
            deletedAt: { not: null }
        },
        orderBy: {
            deletedAt: "desc"
        },
        include: {
            translations: true,
            media: true
        }
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Архів</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються видалені публікації. Ви можете відновити їх або видалити назавжди.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/news">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до новин
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <DataTable 
                    columns={trashColumns} 
                    data={trashedPosts} 
                    searchPlaceholder="Пошук за заголовком..."
                    filters={trashFilters}
                />
            </div>
        </div>
    )
}