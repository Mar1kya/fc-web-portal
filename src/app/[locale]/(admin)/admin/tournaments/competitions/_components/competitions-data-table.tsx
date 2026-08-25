"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, TournamentWithRelations } from "./columns";

type CompetitionsDataTableProps = {
    data: TournamentWithRelations[];
    activeSeasonId: string | null;
    activeSeasonName: string | null;
};

export function CompetitionsDataTable({ data, activeSeasonId, activeSeasonName }: CompetitionsDataTableProps) {
    const columns = useMemo(
        () => getColumns({ activeSeasonId, activeSeasonName }),
        [activeSeasonId, activeSeasonName]
    );

    return (
        <DataTable
            columns={columns}
            data={data}
            searchPlaceholder="Пошук за назвою..."
        />
    );
}