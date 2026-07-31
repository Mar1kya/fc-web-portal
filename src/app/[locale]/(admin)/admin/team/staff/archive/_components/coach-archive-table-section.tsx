import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";
import { TeamContext } from "../../../../../../../../../generated/prisma";

export default async function CoachesArchivTableSection({ currentTeam }: { currentTeam: TeamContext }) {
    const archivedCoaches = await prisma.coach.findMany({
        where: {
            deletedAt: { not: null },
            teamContext: currentTeam
        },
        orderBy: {
            deletedAt: "desc"
        },
        include: {
            translations: true
        }
    });

    return (
        <DataTable
            columns={archiveColumns}
            data={archivedCoaches}
            searchPlaceholder="Пошук за ім'ям..."
        />
    );
}