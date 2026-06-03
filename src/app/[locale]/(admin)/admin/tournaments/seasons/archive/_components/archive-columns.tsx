"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Season } from "../../../../../../../../../generated/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, CalendarRange } from "lucide-react"
import { ArchiveActions } from "./archive-actions"

export const archiveColumns: ColumnDef<Season>[] = [
    {
        accessorKey: "name",
        header: "Назва сезону",
        cell: ({ row }) => (
            <div className="font-medium text-muted-foreground">
                {row.original.name}
            </div>
        ),
    },
    {
        id: "duration",
        header: "Період проведення",
        cell: ({ row }) => {
            const start = new Date(row.original.startDate).toLocaleDateString("uk-UA");
            const end = new Date(row.original.endDate).toLocaleDateString("uk-UA");
            return (
                <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                    <CalendarRange className="w-4 h-4" />
                    <span>{start} — {end}</span>
                </div>
            )
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
                <span className="text-muted-foreground/70">—</span>
            );
        },
    },
    {
        accessorKey: "deletedAt",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4 text-muted-foreground">
                    Дата видалення
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.original.deletedAt as Date);
            return (
                <div className="whitespace-nowrap text-sm text-muted-foreground">
                    {date.toLocaleDateString("uk-UA")} о {date.toLocaleTimeString("uk-UA", { hour: '2-digit', minute: '2-digit' })}
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ArchiveActions season={row.original} />,
    },
]