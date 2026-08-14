import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";

export default async function OpponentsArchiveTableSection() {
    const archivedOpponents = await prisma.opponent.findMany({
        where: {
            deletedAt: { not: null }
        },
        include: {
            translations: true
        },
        orderBy: {
            deletedAt: "desc"
        },
        take: 500,
    });

    return (
        <DataTable
            columns={archiveColumns}
            data={archivedOpponents}
            searchPlaceholder="Пошук команди..."
        />
    );
}