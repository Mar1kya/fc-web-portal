"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import Image from "next/image"
import { getTranslation } from "@/lib/utils/get-translation"
import { ArchiveActions } from "./archive-actions"
import { PlayerPosition } from "../../../../../../../../../generated/prisma"
import { PlayerWithRelations } from "../../_components/columns"

const positionTranslations: Record<PlayerPosition, string> = {
    GOALKEEPER: "Воротар",
    DEFENDER: "Захисник",
    MIDFIELDER: "Півзахисник",
    FORWARD: "Нападник",
};

export const archiveColumns: ColumnDef<PlayerWithRelations>[] = [
    {
        accessorKey: "number",
        header: "#",
        cell: ({ row }) => <div className="font-semibold text-muted-foreground w-8">{row.original.number}</div>,
    },
    {
        id: "name",
        accessorFn: (row) => getTranslation(row, "uk")?.name || "",
        header: "Гравець",
        cell: ({ row }) => {
            const player = row.original;
            const translation = getTranslation(player, "uk");
            return (
                <div className="flex items-center gap-3 opacity-60 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted border shrink-0">
                        {player.avatar ? (
                            <Image src={player.avatar} alt="Avatar" fill className="object-cover" sizes="40px" unoptimized />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">?</div>
                        )}
                    </div>
                    <div className="font-medium truncate text-muted-foreground">
                        {translation?.name || "Без імені"}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "position",
        header: "Позиція",
        cell: ({ row }) => (
            <Badge variant="outline" className="text-muted-foreground">
                {positionTranslations[row.original.position]}
            </Badge>
        ),
        filterFn: (row, id, value) => {
            if (!value || value === "ALL") return true;
            return row.getValue(id) === value;
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
        cell: ({ row }) => <ArchiveActions player={row.original} />,
    },
]