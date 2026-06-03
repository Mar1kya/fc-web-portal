"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Season } from "../../../../../../../../generated/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { ActiveSwitch } from "./active-switch"
import { SeasonActions } from "./season-actions"

export const columns: ColumnDef<Season>[] = [
    {
        accessorKey: "name",
        header: "Назва сезону",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "startDate",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                    Період проведення
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const start = new Date(row.original.startDate).toLocaleDateString("uk-UA");
            const end = new Date(row.original.endDate).toLocaleDateString("uk-UA");
            return (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{start} - {end}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "isActive",
        header: "Статус",
        cell: ({ row }) => <ActiveSwitch season={row.original} />,
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
        cell: ({ row }) => <SeasonActions season={row.original} />,
    },
]