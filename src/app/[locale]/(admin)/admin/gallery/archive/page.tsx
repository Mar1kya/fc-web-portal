import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { galleryArchiveColumns } from "./_components/archive-columns";

export const metadata = {
    title: "Архів галерей",
    description: "Управління видаленими галереями",
};

export default async function GalleryTrashPage() {
    const archivedGalleries = await prisma.gallery.findMany({
        where: {
            deletedAt: { not: null },
        },
        include: {
            translations: true,
            media: true,
            match: {
                include: {
                    opponent: {
                        include: { translations: true },
                    },
                },
            },
        },
        orderBy: {
            deletedAt: "desc",
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Архів галерей</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються видалені галереї. Ви можете відновити їх або остаточно видалити.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/gallery">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до галереї
                    </Link>
                </Button>
            </div>
            <div className="mt-2">
                <DataTable
                    columns={galleryArchiveColumns}
                    data={archivedGalleries}
                    searchPlaceholder="Пошук за назвою галереї..."
                />
            </div>
        </div>
    );
}