"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { StandingsSwitch } from "./standings-switch";
import { getTranslation } from "@/lib/utils/get-translation";
import { Tournament, TournamentTranslation, TournamentSeason } from "../../../../../../../../generated/prisma";
import { TournamentActions } from "./tournament-actions";
import { teamContextTranslations } from "@/lib/constants";

export type TournamentWithRelations = Tournament & {
    translations: TournamentTranslation[];
    tournamentSeasons: TournamentSeason[];
};

type GetColumnsOptions = {
    activeSeasonId: string | null;
    activeSeasonName: string | null;
};

export function getColumns({ activeSeasonId, activeSeasonName }: GetColumnsOptions): ColumnDef<TournamentWithRelations>[] {
    return [
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
            accessorKey: "teamContext",
            header: "Команда",
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {teamContextTranslations[row.original.teamContext]}
                </Badge>
            ),
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
            cell: ({ row }) => (
                <TournamentActions
                    tournament={row.original}
                    activeSeasonId={activeSeasonId}
                    activeSeasonName={activeSeasonName}
                />
            ),
        },
    ];
}