import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

export default async function SeasonsTableSection() {
    const seasons = await prisma.season.findMany({
        where: {
            deletedAt: null
        },
        orderBy: {
            startDate: "desc"
        }
    });

    return (
        <DataTable
            columns={columns}
            data={seasons}
            searchPlaceholder="Пошук за назвою (напр. 2025/26)..."
        />
    );
}