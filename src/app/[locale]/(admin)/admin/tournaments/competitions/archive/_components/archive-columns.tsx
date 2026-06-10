"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { ArchiveActions } from "./archive-actions";
import { getTranslation } from "@/lib/utils/get-translation";
import { TournamentWithRelations } from "../../_components/columns";

export const archiveColumns: ColumnDef<TournamentWithRelations>[] = [
    {
        id: "name",
        accessorFn: (row) => getTranslation(row, "uk")?.name || row.slug,
        header: "Назва турніру",
        cell: ({ row }) => {
            const name = getTranslation(row.original, "uk")?.name || row.original.slug;
            return <div className="font-medium text-muted-foreground">{name}</div>;
        },
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
        header: ({ column }) => {
            return (
                <Button 
                    variant="ghost" 
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
                    className="-ml-4 text-muted-foreground"
                >
                    Дата видалення
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
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
        cell: ({ row }) => <ArchiveActions tournament={row.original} />,
    },
];