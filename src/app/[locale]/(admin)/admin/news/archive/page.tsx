import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"
import AdminTableSkeleton from "../../_components/admin-table-skeleton"
import NewsArchiveTableSection from "./_components/news-archive-table-section"

export const metadata: Metadata = {
    title: "Кошик новин",
    description: "Управління видаленими публікаціями."
}

export default function ArchivePage() {
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
            <Suspense fallback={<AdminTableSkeleton columns={6} rows={10} />}>
                <NewsArchiveTableSection />
            </Suspense>
        </div>
    )
}