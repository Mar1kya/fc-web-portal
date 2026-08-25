import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";
import { TeamContext } from "../../../../../../../../../generated/prisma";

type MatchesArchiveTableSectionProps = {
    currentTeam: TeamContext;
    seasonId?: string;
};

export default async function MatchesArchiveTableSection({ currentTeam, seasonId }: MatchesArchiveTableSectionProps) {
    const archivedMatches = await prisma.match.findMany({
        where: {
            deletedAt: { not: null },
            teamContext: currentTeam,
            ...(seasonId ? { seasonId } : {}),
        },
        include: {
            opponent: {
                include: { translations: { where: { language: "uk" } } }
            },
        },
        orderBy: { deletedAt: "desc" },
        take: 500,
    });

    return (
        <DataTable
            columns={archiveColumns}
            data={archivedMatches}
            searchPlaceholder="Пошук за назвою команди..."
        />
    );
}