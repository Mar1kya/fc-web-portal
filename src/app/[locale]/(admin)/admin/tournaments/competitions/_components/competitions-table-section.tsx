import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function CompetitionsTableSection() {
    const tournaments = await prisma.tournament.findMany({
        where: {
            deletedAt: null,
        },
        include: {
            translations: true,
        },
        orderBy: {
            hasStandings: "desc",
        },
    });

    return (
        <DataTable
            columns={columns}
            data={tournaments}
            searchPlaceholder="Пошук за назвою..."
        />
    );
}