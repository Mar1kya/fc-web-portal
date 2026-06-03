import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { columns } from "./_components/columns"
import { DataTable, DataTableFilterOption } from "@/components/ui/data-table"
import { postStatusOptions, postTypeTranslations, teamContextTranslations } from "@/lib/constants"

export const metadata = {
    title: "Новини",
    description: "Управління публікаціями, інтерв'ю та заявами клубу."
}

const newsFilters: DataTableFilterOption[] = [
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
    {
        columnId: "isPublished",
        placeholder: "Всі статуси",
        options: postStatusOptions,
    },
];

export default async function AdminNewsPage() {
    const posts = await prisma.post.findMany({
        where: {
            deletedAt: null
        },
        orderBy: {
            createdAt: "desc"
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
                    <h2 className="text-3xl font-bold tracking-tight">Новини</h2>
                    <p className="text-muted-foreground mt-1">
                        Управління публікаціями, інтерв&apos;ю та заявами клубу.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/news/trash">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Кошик
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/news/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Додати новину
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="mt-4">
                <DataTable
                    columns={columns}
                    data={posts}
                    searchPlaceholder="Пошук за заголовком..."
                    filters={newsFilters}
                />
            </div>
        </div>
    )
}