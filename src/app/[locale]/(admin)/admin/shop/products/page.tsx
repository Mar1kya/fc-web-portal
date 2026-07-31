import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { Suspense } from "react";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import ProductsTableSection from "./_components/products-table-section";

export const metadata: Metadata = {
    title: "Товари",
    description: "Управління асортиментом інтернет-магазину",
};

export default async function ProductsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Асортимент</h2>
                    <p className="text-muted-foreground mt-1">
                        Керуйте товарами, цінами та залишками на складі.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/shop/products/archive">
                            <Archive className="mr-2 h-4 w-4" />
                            Архів
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/shop/products/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Додати товар
                        </Link>
                    </Button>
                </div>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <ProductsTableSection />
            </Suspense>
        </div>
    );
}