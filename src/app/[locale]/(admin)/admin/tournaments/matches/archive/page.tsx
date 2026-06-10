import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./_components/archive-columns";

export const metadata = {
    title: "Архів матчів",
    description: "Управління видаленими матчами",
};

export default async function MatchesArchivePage() {
    const archivedMatches = await prisma.match.findMany({
        where: {
            deletedAt: { not: null },
        },
        include: {
            opponent: {
                include: { translations: true }
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
                    <h2 className="text-3xl font-bold tracking-tight">Архів матчів</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються видалені ігри. Ви можете відновити їх або остаточно очистити.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/tournaments/matches">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до розкладу
                    </Link>
                </Button>
            </div>
            <div className="mt-2">
                <DataTable
                    columns={archiveColumns}
                    data={archivedMatches}
                    searchPlaceholder="Пошук за назвою команди..."
                />
            </div>
        </div>
    );
}