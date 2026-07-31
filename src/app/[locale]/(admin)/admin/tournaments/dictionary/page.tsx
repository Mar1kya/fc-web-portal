import { Metadata } from "next";
import { Suspense } from "react";
import AdminTableSkeleton from "../../_components/admin-table-skeleton";
import DictionaryTableSection from "./_components/dictionary-table-section";

export const metadata: Metadata = {
    title: "Словник команд",
    description: "Управління словником команд."

};

export default async function DictionaryPage() {

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Словник команд</h2>
                <p className="text-muted-foreground mt-1">
                    Управління перекладами команд, які автоматично завантажуються зі стороннього API (SofaScore).
                </p>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <DictionaryTableSection />
            </Suspense>
        </div>
    );
}