import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";

export default async function CompetitionsArchiveTableSection() {
    const archivedTournaments = await prisma.tournament.findMany({
        where: {
            deletedAt: { not: null }
        },
        include: {
            translations: { where: { language: "uk" } },
            tournamentSeasons: true, 
        }, orderBy: {
            deletedAt: "desc"
        }
    });

    return (
        <DataTable
            columns={archiveColumns}
            data={archivedTournaments}
            searchPlaceholder="Пошук за назвою турніру..."
        />
    );
}