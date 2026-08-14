import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";

export default async function CategoriesArchiveTableSection() {
    const archivedCategories = await prisma.category.findMany({
        where: {
            deletedAt: { not: null }
        },
        include: {
            translations: { where: { language: "uk" } },
            _count: {
                select: {
                    products: {
                        where: { deletedAt: null }
                    }
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