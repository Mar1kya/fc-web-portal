import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

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

export default async function ProductsTableSection() {
    const rawProducts = await prisma.product.findMany({
        where: {
            deletedAt: null,
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

    return (
        <DataTable
            columns={columns}
            data={products}
            searchPlaceholder="Пошук за назвою товару..."
            filters={filterConfigs}
        />
    );
}