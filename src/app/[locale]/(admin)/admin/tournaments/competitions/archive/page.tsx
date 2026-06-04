import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./_components/archive-columns";

export const metadata: Metadata = {
    title: "Архів турнірів",
    description: "Управління архівованими турнірами та змаганнями.",
};

export default async function TournamentsArchivePage() {
    const archivedTournaments = await prisma.tournament.findMany({
        where: {
            deletedAt: { not: null }
        },
        include: {
            translations: true
        },
        orderBy: {
            deletedAt: "desc"
        }
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Архів турнірів</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються видалені турніри. Ви можете відновити їх або очистити базу даних.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/tournaments/competitions">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до списку турнірів
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <DataTable 
                    columns={archiveColumns} 
                    data={archivedTournaments} 
                    searchPlaceholder="Пошук за назвою турніру..."
                />
            </div>
        </div>
    );
}