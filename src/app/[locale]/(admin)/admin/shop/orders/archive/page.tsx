
import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import AdminTableSkeleton from "../../../_components/admin-table-skeleton";
import OrdersArchiveTableSection from "./_components/orders-archive-table-section";

export const metadata: Metadata = {
    title: "Архів замовлень",
    description: "Приховані замовлення інтернет-магазину.",
};

export default async function OrdersArchivePage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Архів замовлень</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються приховані замовлення. Можна відновити або видалити назавжди.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/shop/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до замовлень
                    </Link>
                </Button>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <OrdersArchiveTableSection />
            </Suspense>
        </div>
    );
}