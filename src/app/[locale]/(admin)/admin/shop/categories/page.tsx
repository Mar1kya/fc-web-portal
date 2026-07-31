import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { Suspense } from "react";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import CategoriesTableSection from "./_components/categories-table-section";

export const metadata: Metadata = {
    title: "Категорії товарів",
    description: "Управління категоріями інтернет-магазину.",
};

export default async function CategoriesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Категорії</h2>
                    <p className="text-muted-foreground mt-1">
                        Керуйте розділами магазину.
                    </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" asChild className="gap-2 flex-1 sm:flex-none">
                        <Link href="/admin/shop/categories/archive">
                            <Archive className="w-4 h-4" />
                            Архів
                        </Link>
                    </Button>
                    <Button asChild className="gap-2 flex-1 sm:flex-none">
                        <Link href="/admin/shop/categories/create">
                            <Plus className="w-4 h-4" />
                            Створити категорію
                        </Link>
                    </Button>
                </div>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <CategoriesTableSection />
            </Suspense>
        </div>
    );
}