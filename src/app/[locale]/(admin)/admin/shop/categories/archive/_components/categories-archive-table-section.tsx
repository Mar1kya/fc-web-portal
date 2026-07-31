import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";

export default async function CategoriesArchiveTableSection() {
    const archivedCategories = await prisma.category.findMany({
        where: {
            deletedAt: { not: null }
        },
        include: {
            translations: true,
            _count: {
                select: {
                    products: true
                }
            }
        },
        orderBy: {
            deletedAt: "desc"
        }
    });

    return (
        <DataTable
            columns={archiveColumns}
            data={archivedCategories}
            searchPlaceholder="Пошук за назвою категорії..."
        />
    );
}