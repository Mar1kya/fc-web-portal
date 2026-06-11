import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./_components/archive-columns";

export const metadata: Metadata = {
    title: "Архів товарів",
    description: "Управління архівованими товарами інтернет-магазину.",
};

export default async function ProductsArchivePage() {
    const rawArchivedProducts = await prisma.product.findMany({
        where: {
            deletedAt: { not: null }
        },
        include: {
            translations: true,
            category: {
                include: { translations: true }
            },
            media: true,
            variants: true,
        },
        orderBy: {
            deletedAt: "desc"
        }
    });

    const archivedProducts = rawArchivedProducts.map(product => ({
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
    }));

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
            <div className="mt-4">
                <DataTable 
                    columns={archiveColumns} 
                    data={archivedProducts} 
                    searchPlaceholder="Пошук за назвою товару..."
                />
            </div>
        </div>
    );
}