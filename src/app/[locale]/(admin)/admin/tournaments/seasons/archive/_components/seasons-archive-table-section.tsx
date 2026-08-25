import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";

export default async function SeasonsArchiveTableSection() {
    const archivedSeasons = await prisma.season.findMany({
        where: {
            deletedAt: { not: null }
        },
        orderBy: {
            startDate: "desc"
        }
    });

    return (
        <DataTable
            columns={archiveColumns}
            data={archivedSeasons}
            searchPlaceholder="Пошук за назвою сезону..."
        />
    );
}