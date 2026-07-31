import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Archive, Plus } from "lucide-react"
import { SeasonModal } from "./_components/season-modal"
import SeasonsTableSection from "./_components/seasons-table-section"
import { Suspense } from "react"
import AdminTableSkeleton from "../../_components/admin-table-skeleton"

export const metadata = {
    title: "Сезони",
    description: "Управління футбольними сезонами."
}

export default async function SeasonsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Сезони</h2>
                    <p className="text-muted-foreground mt-1">
                        Додавайте нові сезони та керуйте поточним активним сезоном сайту.
                    </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" asChild className="gap-2 flex-1 sm:flex-none">
                        <Link href="/admin/tournaments/seasons/archive">
                            <Archive className="w-4 h-4" />
                            Архів
                        </Link>
                    </Button>
                    <SeasonModal
                        trigger={
                            <Button className="gap-2 flex-1 sm:flex-none">
                                <Plus className="w-4 h-4" />
                                Створити сезон
                            </Button>
                        }
                    />
                </div>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <SeasonsTableSection />
            </Suspense>
        </div>
    )
}