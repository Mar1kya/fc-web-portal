"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { ArchiveActions } from "./archive-actions";
import { getTranslation } from "@/lib/utils/get-translation";
import { StandingsTeamLogo } from "../../../standings/_components/tandings-team-logo";
import { Opponent, OpponentTranslation } from "../../../../../../../../../generated/prisma";

type OpponentWithTranslations = Opponent & {
    translations: OpponentTranslation[];
};

export const archiveColumns: ColumnDef<OpponentWithTranslations>[] = [
    {
        accessorKey: "logoUrl",
        header: "Лого",
        cell: ({ row }) => {
            const teamName = getTranslation(row.original, "uk")?.name || "Team";
            return (
                <div className="opacity-60 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                    <StandingsTeamLogo 
                        src={row.original.logoUrl} 
                        alt={teamName} 
                        fallbackText={teamName} 
                    />
                </div>
            );
        },
    },
    {
        id: "nameUk",
        accessorFn: (row) => getTranslation(row, "uk")?.name || "—",
        header: "Назва (Українською)",
        cell: ({ getValue }) => <div className="font-medium text-muted-foreground">{getValue() as string}</div>,
    },
    {
        id: "nameEn",
        accessorFn: (row) => getTranslation(row, "en")?.name || "—",
        header: "Назва (Англійською)",
        cell: ({ getValue }) => <div className="text-muted-foreground/70">{getValue() as string}</div>,
    },
    {
        accessorKey: "sofascoreId",
        header: "SofaScore ID",
        cell: ({ row }) => {
            const id = row.original.sofascoreId;
            return id ? (
                <Badge variant="outline" className="opacity-60">{id}</Badge>
            ) : (
                <span className="text-muted-foreground/60">—</span>
            );
        },
    },
    {
        accessorKey: "deletedAt",
        header: ({ column }) => (
            <Button 
                variant="ghost" 
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
                className="-ml-4 text-muted-foreground"
            >
                Дата видалення
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            if (!row.original.deletedAt) return null;
            const date = new Date(row.original.deletedAt);
            return (
                <div className="whitespace-nowrap text-sm text-muted-foreground">
                    {date.toLocaleDateString("uk-UA")} о {date.toLocaleTimeString("uk-UA", { hour: '2-digit', minute: '2-digit' })}
                </div>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ArchiveActions opponent={row.original} />,
    },
];