import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";
import { TeamContext } from "../../../../../../../../../generated/prisma";

export default async function OpponentsArchiveTableSection({ currentTeam }: { currentTeam: TeamContext }) {
    const archivedOpponents = await prisma.opponent.findMany({
        where: {
            deletedAt: { not: null },
            matches: {
                some: {
                    teamContext: currentTeam,
                },
            },
        },
        include: {
            translations: true,
        },
        orderBy: {
            slug: "asc",
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