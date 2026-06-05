import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/columns";

export const metadata = {
    title: "Суперники",
    description: "Управління списком команд-суперників",
};

export default async function OpponentsPage() {
    const opponents = await prisma.opponent.findMany({
        where: {
            deletedAt: null,
        },
        include: {
            translations: true,
        },
        orderBy: {
            slug: "asc",
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Суперники</h2>
                    <p className="text-muted-foreground mt-1">
                        База команд-суперників для формування розкладу матчів.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/tournaments/opponents/archive">
                            <Archive className="w-4 h-4" />
                            Архів
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/tournaments/opponents/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Додати суперника
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="mt-2">
                <DataTable
                    columns={columns}
                    data={opponents}
                    searchPlaceholder="Пошук суперника..."
                />
            </div>
        </div>
    );
}