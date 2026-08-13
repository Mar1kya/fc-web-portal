import { DataTable } from "@/components/ui/data-table";
import { prisma } from "@/lib/prisma";
import { columns } from "./columns";

export default async function GalleryTableSection() {
    const galleries = await prisma.gallery.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            translations: { where: { language: "uk" } },
            media: true,
            match: {
                include: {
                    opponent: {
                        include: {
                            translations: { where: { language: "uk" } },
                        },
                    },
                    tournament: true,
                },
            },
        },
        take: 200,
    })

    return (
        <DataTable
            columns={columns}
            data={galleries}
            searchPlaceholder="Пошук за назвою галереї..."
        />
    );
}