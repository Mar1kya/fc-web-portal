import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

export default async function OpponentsTableSection() {
    const opponents = await prisma.opponent.findMany({
        where: {
            deletedAt: null,
        },
        include: {
            translations: true,
        },
        orderBy: {
            slug: "asc",
        },
    });

    return (
        <DataTable
            columns={columns}
            data={opponents}
            searchPlaceholder="Пошук суперника..."
        />
    );
}