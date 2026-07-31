import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import AdminTableSkeleton from "../../../_components/admin-table-skeleton";
import CategoriesArchiveTableSection from "./_components/categories-archive-table-section";

export const metadata: Metadata = {
    title: "Архів категорій",
    description: "Управління архівованими категоріями магазину.",
};

export default async function CategoriesArchivePage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Архів категорій</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються видалені категорії. Ви можете відновити їх або очистити базу даних.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/shop/categories">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до списку категорій
                    </Link>
                </Button>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <CategoriesArchiveTableSection />
            </Suspense>
        </div>
    );
}