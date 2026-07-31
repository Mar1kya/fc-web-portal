import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"
import SeasonsArchiveTableSection from "./_components/seasons-archive-table-section"
import AdminTableSkeleton from "../../../_components/admin-table-skeleton"

export const metadata = {
    title: "Архів сезонів",
    description: "Управління архівованими сезонами."
}

export default async function SeasonsArchivePage() {
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
            <Suspense fallback={<AdminTableSkeleton />}>
                <SeasonsArchiveTableSection />
            </Suspense>
        </div>
    )
}