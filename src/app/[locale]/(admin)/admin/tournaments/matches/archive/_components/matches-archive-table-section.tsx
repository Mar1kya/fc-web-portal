import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";
import { TeamContext } from "../../../../../../../../../generated/prisma";

export default async function MatchesArchiveTableSection({ currentTeam }: { currentTeam: TeamContext }) {
    const archivedMatches = await prisma.match.findMany({
        where: {
            deletedAt: { not: null },
            teamContext: currentTeam,
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
        <DataTable
            columns={archiveColumns}
            data={archivedMatches}
            searchPlaceholder="Пошук за назвою команди..."
        />
    );
}