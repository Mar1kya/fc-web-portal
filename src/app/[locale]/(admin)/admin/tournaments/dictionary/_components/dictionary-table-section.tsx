import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { TeamContext } from "../../../../../../../../generated/prisma";

export default async function DictionaryTableSection({ currentTeam }: { currentTeam: TeamContext }) {
    const dictionaryEntries = await prisma.teamDictionary.findMany({
        where: { teamContext: currentTeam },
        include: {
            translations: true,
        },
        orderBy: {
            originalName: "asc",
        },
        take: 500,
    });

    return (
        <DataTable
            columns={columns}
            data={dictionaryEntries}
            searchPlaceholder="Пошук за оригінальною назвою..."
        />
    );
}