import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { Suspense } from "react";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import CompetitionsTableSection from "./_components/competitions-table-section";

export const metadata: Metadata = {
    title: "Турніри",
    description: "Управління футбольними турнірами та змаганнями.",
};

export default async function CompetitionsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Турніри</h2>
                    <p className="text-muted-foreground mt-1">
                        Керуйте списком змагань (УПЛ, Кубок) та завантаженням турнірних таблиць.
                    </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" asChild className="gap-2 flex-1 sm:flex-none">
                        <Link href="/admin/tournaments/competitions/archive">
                            <Archive className="w-4 h-4" />
                            Архів
                        </Link>
                    </Button>
                    <Button asChild className="gap-2 flex-1 sm:flex-none">
                        <Link href="/admin/tournaments/competitions/create">
                            <Plus className="w-4 h-4" />
                            Створити турнір
                        </Link>
                    </Button>
                </div>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <CompetitionsTableSection />
            </Suspense>
        </div>
    );
}