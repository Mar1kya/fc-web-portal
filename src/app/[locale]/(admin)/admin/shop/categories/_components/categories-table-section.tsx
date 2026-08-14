import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function CategoriesTableSection() {
    const categories = await prisma.category.findMany({
        where: {
            deletedAt: null,
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
            slug: "asc",
        },
    });
    return (
        <DataTable
            columns={columns}
            data={categories}
            searchPlaceholder="Пошук за назвою..."
        />
    );
}