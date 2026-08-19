import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { TeamContext } from "../../../../../../../../generated/prisma";

export default async function OpponentsTableSection({ currentTeam }: { currentTeam: TeamContext }) {
    const opponents = await prisma.opponent.findMany({
        where: {
            deletedAt: null,
            matches: {
                some: {
                    teamContext: currentTeam,
                    deletedAt: null,
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
            columns={columns}
            data={opponents}
            searchPlaceholder="Пошук суперника..."
        />
    );
}