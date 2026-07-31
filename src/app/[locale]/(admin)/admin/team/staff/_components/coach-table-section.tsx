import { prisma } from "@/lib/prisma";
import { TeamContext } from "../../../../../../../../generated/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function CoachesTableSection({ currentTeam }: { currentTeam: TeamContext }) {
    const coaches = await prisma.coach.findMany({
        where: {
            deletedAt: null,
            teamContext: currentTeam
        },
        include: { translations: true },
        orderBy: { createdAt: "asc" }
    });

    return (
        <DataTable
            columns={columns}
            data={coaches}
            searchPlaceholder="Пошук за ім'ям..."
        />
    );
}