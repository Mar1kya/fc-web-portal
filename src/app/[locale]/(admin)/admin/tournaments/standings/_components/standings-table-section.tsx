import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function StandingsTableSection({ seasonId, tournamentId }: { seasonId: string; tournamentId: string }) {
    const standings = await prisma.standing.findMany({
        where: {
            seasonId,
            tournamentId,
        },
        orderBy: {
            rank: "asc"
        }
    });

    return (
        <DataTable
            columns={columns}
            data={standings}
            searchPlaceholder="Пошук команди..."
        />
    );
}