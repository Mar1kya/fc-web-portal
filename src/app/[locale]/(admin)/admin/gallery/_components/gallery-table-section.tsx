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
            translations: true,
            media: true,
            match: {
                include: {
                    opponent: {
                        include: {
                            translations: true,
                        },
                    },
                    tournament: true,
                },
            },
        },
    })

    return (
        <DataTable
            columns={columns}
            data={galleries}
            searchPlaceholder="Пошук за назвою галереї..."
        />
    );
}