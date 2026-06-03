"use client"

import { ColumnDef } from "@tanstack/react-table"
import { getTranslation } from "@/lib/utils/get-translation"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Prisma } from "../../../../../../../../generated/prisma"
import { CoachActions } from "./coach-actions"
import { User } from "lucide-react"

export type CoachWithRelations = Prisma.CoachGetPayload<{
    include: { translations: true }
}>;

export const columns: ColumnDef<CoachWithRelations>[] = [
    {
        id: "name",
        accessorFn: (row) => {
            const translation = getTranslation(row, "uk");
            return translation?.name || "";
        },
        header: "Співробітник",
        cell: ({ row }) => {
            const coach = row.original;
            const translation = getTranslation(coach, "uk");

            return (
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full border overflow-hidden bg-muted/50 shrink-0 flex items-center justify-center group">
                        {coach.avatar ? (
                            <Image
                                src={coach.avatar}
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
        id: "role",
        header: "Посада",
        cell: ({ row }) => {
            const translation = getTranslation(row.original, "uk");
            return (
                <Badge variant="outline">
                    {translation?.role || "Не вказано"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <CoachActions coach={row.original} />,
    },
]