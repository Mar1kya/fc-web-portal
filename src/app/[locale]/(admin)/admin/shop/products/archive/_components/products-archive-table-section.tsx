import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";

export default async function ProductsArchiveTableSection() {
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
        <DataTable
            columns={archiveColumns}
            data={archivedProducts}
            searchPlaceholder="Пошук за назвою товару..."
        />
    );
}