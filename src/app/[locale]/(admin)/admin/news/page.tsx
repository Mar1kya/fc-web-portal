import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Archive, Plus } from "lucide-react"
import { Suspense } from "react";
import AdminTableSkeleton from "../_components/admin-table-skeleton";
import NewsTableSection from "./_components/news-table-section";

export const metadata = {
    title: "Новини",
    description: "Управління публікаціями, інтерв'ю та заявами клубу."
}


export default function AdminNewsPage() {
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
                        <Link href="/admin/news/archive">
                            <Archive className="w-4 h-4" />
                            Архів
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
                <Suspense fallback={<AdminTableSkeleton columns={7} rows={10} />}>
                    <NewsTableSection />
                </Suspense>
            </div>
        </div>
    );
}