import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DataTable } from "../_components/data-table"
import { trashColumns } from "./_components/trash-columns"

export const metadata: Metadata = {
    title: "Кошик новин",
    description: "Управління видаленими публікаціями."
}

export default async function TrashPage() {
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
                    <h2 className="text-3xl font-bold tracking-tight">Кошик</h2>
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
                <DataTable columns={trashColumns} data={trashedPosts} />
            </div>
        </div>
    )
}