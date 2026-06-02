"use client"

import { ColumnDef } from "@tanstack/react-table"
import { getTranslation } from "@/lib/utils/get-translation"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { PlayerPosition, Prisma } from "../../../../../../../../generated/prisma"
import { PlayerActions } from "./player-actions"
import { User } from "lucide-react"

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
                    <div className="relative w-10 h-10 rounded-full border overflow-hidden bg-muted/50 shrink-0 flex items-center justify-center group">
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
                            <div className="flex flex-col items-center gap-2 text-muted-foreground/50 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/50">
                                <User className="w-6 h-6" strokeWidth={1.5} />
                            </div>
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