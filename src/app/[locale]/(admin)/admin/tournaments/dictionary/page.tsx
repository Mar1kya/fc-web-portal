import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/columns";

export const metadata: Metadata = {
    title: "Словник команд",
};

export default async function DictionaryPage() {
    const dictionaryEntries = await prisma.teamDictionary.findMany({
        include: {
            translations: true,
        },
        orderBy: {
            originalName: "asc",
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Словник команд</h2>
                <p className="text-muted-foreground mt-1">
                    Управління перекладами команд, які автоматично завантажуються зі стороннього API (SofaScore).
                </p>
            </div>
            <div className="mt-2">
                <DataTable 
                    columns={columns} 
                    data={dictionaryEntries} 
                    searchPlaceholder="Пошук за оригінальною назвою..."
                />
            </div>
        </div>
    );
}