import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import { Suspense } from "react";
import GalleryArchiveTableSection from "./_components/gallery-archive-table-section";

export const metadata = {
    title: "Архів галерей",
    description: "Управління видаленими галереями",
};

export default function GalleryTrashPage() {
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
            <Suspense fallback={<AdminTableSkeleton />}>
                <GalleryArchiveTableSection />
            </Suspense>
        </div>
    );
}