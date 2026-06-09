import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Archive, Plus } from "lucide-react"
import { columns } from "./_components/columns"
import { DataTable } from "@/components/ui/data-table"

export const metadata = {
    title: "Галерея",
    description: "Управління фотогалереями матчів та подій клубу."
}

export default async function AdminGalleryPage() {
    const galleries = await prisma.gallery.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            translations: true,
            media: true,
            match: {
                include: {
                    opponent: {
                        include: {
                            translations: true,
                        },
                    },
                    tournament: true,
                },
            },
        },
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Галерея</h2>
                    <p className="text-muted-foreground mt-1">
                        Управління фотогалереями матчів та подій клубу.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/gallery/archive">
                            <Archive className="w-4 h-4" />
                            Архів
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/gallery/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Додати галерею
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="mt-4">
                <DataTable
                    columns={columns}
                    data={galleries}
                    searchPlaceholder="Пошук за назвою галереї..."
                />
            </div>
        </div>
    )
}