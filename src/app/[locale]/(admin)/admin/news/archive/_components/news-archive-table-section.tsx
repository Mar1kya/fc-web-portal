import { DataTable, DataTableFilterOption } from "@/components/ui/data-table";
import { prisma } from "@/lib/prisma";
import { trashColumns } from "./archive-columns";
import { postTypeTranslations, teamContextTranslations } from "@/lib/constants";

const trashFilters: DataTableFilterOption[] = [
    {
        columnId: "teamContext",
        placeholder: "Всі команди",
        options: Object.entries(teamContextTranslations).map(([value, label]) => ({
            value,
            label,
        })),
    },
    {
        columnId: "type",
        placeholder: "Всі категорії",
        options: Object.entries(postTypeTranslations).map(([value, label]) => ({
            value,
            label,
        })),
    },
];
export default async function NewsArchiveTableSection() {
    const trashedPosts = await prisma.post.findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: "desc" },
        take: 500,
        include: {
            translations: { where: { language: "uk" } },
            media: { take: 1 }
        }
    });

    return (
        <DataTable
            columns={trashColumns}
            data={trashedPosts}
            searchPlaceholder="Пошук за заголовком..."
            filters={trashFilters}
        />
    );
}