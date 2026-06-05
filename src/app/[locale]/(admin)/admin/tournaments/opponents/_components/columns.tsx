"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { getTranslation } from "@/lib/utils/get-translation";
import { Opponent, OpponentTranslation } from "../../../../../../../../generated/prisma";
import { StandingsTeamLogo } from "../../standings/_components/tandings-team-logo";
import { OpponentActions } from "./opponent-actions";

type OpponentWithTranslations = Opponent & {
    translations: OpponentTranslation[];
};

export const columns: ColumnDef<OpponentWithTranslations>[] = [
    {
        accessorKey: "logoUrl",
        header: "Лого",
        cell: ({ row }) => {
            const teamName = getTranslation(row.original, "uk")?.name || "Team";
            return (
                <StandingsTeamLogo 
                    src={row.original.logoUrl} 
                    alt={teamName} 
                    fallbackText={teamName} 
                />
            );
        },
    },
    {
        id: "nameUk",
        accessorFn: (row) => getTranslation(row, "uk")?.name || "—",
        header: "Назва (Українською)",
        cell: ({ getValue }) => {
            return <div className="font-semibold">{getValue() as string}</div>;
        },
    },
    {
        id: "nameEn",
        accessorFn: (row) => getTranslation(row, "en")?.name || "—",
        header: "Назва (Англійською)",
        cell: ({ getValue }) => {
            return <div className="text-muted-foreground">{getValue() as string}</div>;
        },
    },
    {
        accessorKey: "sofascoreId",
        header: "SofaScore ID",
        cell: ({ row }) => (
            row.original.sofascoreId 
                ? <Badge variant="outline">{row.original.sofascoreId}</Badge>
                : <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <div className="flex justify-end"><OpponentActions opponent={row.original} /></div>,
    },
];