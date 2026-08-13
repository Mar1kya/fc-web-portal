import { DataTable } from "@/components/ui/data-table";
import { prisma } from "@/lib/prisma";
import { galleryArchiveColumns } from "./archive-columns";

export default async function GalleryArchiveTableSection() {
    const archivedGalleries = await prisma.gallery.findMany({
        where: {
            deletedAt: { not: null },
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
                },
            },
        },
        orderBy: {
            deletedAt: "desc",
        },
        take: 200,
    });

    return (
        <DataTable
            columns={galleryArchiveColumns}
            data={archivedGalleries}
            searchPlaceholder="Пошук за назвою галереї..."
        />
    );
}