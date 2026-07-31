import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

export default async function DictionaryTableSection() {
    const dictionaryEntries = await prisma.teamDictionary.findMany({
        include: {
            translations: true,
        },
        orderBy: {
            originalName: "asc",
        },
    });

    return (
        <DataTable
            columns={columns}
            data={dictionaryEntries}
            searchPlaceholder="Пошук за оригінальною назвою..."
        />
    );
}