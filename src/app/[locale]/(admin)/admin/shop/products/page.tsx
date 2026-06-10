import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/columns";

export const metadata: Metadata = {
    title: "Товари",
    description: "Управління асортиментом інтернет-магазину",
};

export default async function ProductsPage() {
    const rawProducts = await prisma.product.findMany({
        where: {
            deletedAt: null,
            isArchived: false,
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
            createdAt: "desc",
        },
    });

    const products = rawProducts.map(product => ({
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
    }));

    const filterConfigs = [
        {
            columnId: "status",
            placeholder: "Статус товару",
            options: [
                { label: "Топ продажу", value: "FEATURED" },
                { label: "Акція", value: "SALE" },
                { label: "Звичайні", value: "NORMAL" },
            ]
        }
    ];

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
            <div className="mt-2">
                <DataTable
                    columns={columns}
                    data={products}
                    searchPlaceholder="Пошук за назвою товару..."
                    filters={filterConfigs}
                />
            </div>
        </div>
    );
}