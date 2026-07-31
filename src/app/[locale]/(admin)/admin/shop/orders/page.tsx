import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import OrdersTableSection from "./_components/orders-table-section";

export const metadata = {
    title: "Замовлення",
    description: "Управління замовленнями інтернет-магазину",
};

export default function OrdersPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Замовлення</h2>
                    <p className="text-muted-foreground mt-1">
                        Відстежуйте статуси та деталі замовлень клієнтів.
                    </p>
                </div>
                <Button variant="outline" asChild className="gap-2 w-full sm:w-auto">
                    <Link href="/admin/shop/orders/archive">
                        <Archive className="w-4 h-4" />
                        Архів
                    </Link>
                </Button>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <OrdersTableSection />
            </Suspense>
        </div>
    );
}