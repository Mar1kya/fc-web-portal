import { DataTable, DataTableFilterOption } from "@/components/ui/data-table";
import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { postStatusOptions, postTypeTranslations, teamContextTranslations } from "@/lib/constants";

const newsFilters: DataTableFilterOption[] = [
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
    {
        columnId: "isPublished",
        placeholder: "Всі статуси",
        options: postStatusOptions,
    },
];


export default async function NewsTableSection() {
    const posts = await prisma.post.findMany({
        where: {
            deletedAt: null
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            translations: true,
            media: true
        }
    });

    return (
        <DataTable
            columns={columns}
            data={posts}
            searchPlaceholder="Пошук за заголовком..."
            filters={newsFilters}
        />
    );
}