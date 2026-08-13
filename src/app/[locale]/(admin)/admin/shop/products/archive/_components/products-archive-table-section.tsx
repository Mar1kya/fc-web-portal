import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";

export default async function ProductsArchiveTableSection() {
    const rawArchivedProducts = await prisma.product.findMany({
        where: {
            deletedAt: { not: null }
        },
        include: {
            translations: { where: { language: "uk" } },
            category: {
                include: { translations: { where: { language: "uk" } } }
            },
            media: { take: 1 },
            variants: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 500,
    });

    const archivedProducts = rawArchivedProducts.map(product => ({
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
    }));

    return (
        <DataTable
            columns={archiveColumns}
            data={archivedProducts}
            searchPlaceholder="Пошук за назвою товару..."
        />
    );
}