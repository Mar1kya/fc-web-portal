"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { StandingsSwitch } from "./standings-switch";
import { getTranslation } from "@/lib/utils/get-translation";
import { Tournament, TournamentTranslation } from "../../../../../../../../generated/prisma";
import { TournamentActions } from "./tournament-actions";

export type TournamentWithRelations = Tournament & {
    translations: TournamentTranslation[];
};

export const columns: ColumnDef<TournamentWithRelations>[] = [
    {
        id: "name",
        accessorFn: (row) => getTranslation(row, "uk")?.name || row.slug,
        header: "Назва турніру",
        cell: ({ row }) => {
            const name = getTranslation(row.original, "uk")?.name || row.original.slug;
            return <div className="font-medium text-base">{name}</div>;
        },
    },
    {
        accessorKey: "hasStandings",
        header: "Турнірна таблиця",
        cell: ({ row }) => <StandingsSwitch tournament={row.original} />,
    },
    {
        accessorKey: "sofascoreId",
        header: "SofaScore ID",
        cell: ({ row }) => {
            const id = row.original.sofascoreId;
            return id ? <Badge variant="outline">{id}</Badge> : <span className="text-muted-foreground">—</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <TournamentActions tournament={row.original} />,
    },
];