"use client"

import { ColumnDef } from "@tanstack/react-table"
import { getTranslation } from "@/lib/utils/get-translation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { PlayerPosition, Prisma } from "../../../../../../../../generated/prisma"
import { PlayerActions } from "./player-actions"

export type PlayerWithRelations = Prisma.PlayerGetPayload<{
    include: { translations: true }
}>;


const positionTranslations: Record<PlayerPosition, string> = {
    GOALKEEPER: "Воротар",
    DEFENDER: "Захисник",
    MIDFIELDER: "Півзахисник",
    FORWARD: "Нападник",
};

export const columns: ColumnDef<PlayerWithRelations>[] = [
    {
        accessorKey: "number",
        header: "#",
        cell: ({ row }) => <div className="font-semibold text-muted-foreground w-8">{row.original.number}</div>,
    },
    {
        id: "name",
        accessorFn: (row) => {
            const translation = getTranslation(row, "uk");
            return translation?.name || "";
        },
        header: "Гравець",
        cell: ({ row }) => {
            const player = row.original;
            const translation = getTranslation(player, "uk");

            return (
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted border shrink-0">
                        {player.avatar ? (
                            <Image
                                src={player.avatar}
                                alt={translation?.name || "Аватар"}
                                fill
                                className="object-cover"
                                sizes="40px"
                                unoptimized
                                referrerPolicy="no-referrer"

                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">?</div>
                        )}
                    </div>
                    <div className="font-medium truncate">
                        {translation?.name || "Без імені"}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "position",
        header: "Позиція",
        cell: ({ row }) => {
            const pos = row.original.position;
            return (
                <Badge variant="outline">
                    {positionTranslations[pos]}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            if (!value || value === "ALL") return true;
            return row.getValue(id) === value;
        },
    },
    {
        id: "stats",
        header: "Статистика",
        cell: ({ row }) => {
            const {
                position,
                initialMatches,
                initialGoals,
                initialAssists,
                initialCleanSheets,
                initialGoalsConceded
            } = row.original;

            if (position === "GOALKEEPER") {
                return (
                    <div className="text-sm text-muted-foreground flex gap-3">
                        <span title="Матчі">М: {initialMatches}</span>
                        <span title="Сухі матчі">СМ: {initialCleanSheets}</span>
                        <span title="Пропущені голи">ПГ: {initialGoalsConceded}</span>
                    </div>
                )
            }

            return (
                <div className="text-sm text-muted-foreground flex gap-3">
                    <span title="Матчі">М: {initialMatches}</span>
                    <span title="Голи">Г: {initialGoals}</span>
                    <span title="Асисти">А: {initialAssists}</span>
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <PlayerActions player={row.original} />,
    },
]