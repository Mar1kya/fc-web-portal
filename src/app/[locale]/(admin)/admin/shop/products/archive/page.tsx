import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import AdminTableSkeleton from "../../../_components/admin-table-skeleton";
import ProductsArchiveTableSection from "./_components/products-archive-table-section";

export const metadata: Metadata = {
    title: "Архів товарів",
    description: "Управління архівованими товарами інтернет-магазину.",
};

export default async function ProductsArchivePage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Архів товарів</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються видалені товари. Вони не відображаються на вітрині, але зберігаються для історії замовлень.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/shop/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до списку товарів
                    </Link>
                </Button>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <ProductsArchiveTableSection />
            </Suspense>
        </div>
    );
}