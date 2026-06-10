"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Images, Link2Off } from "lucide-react"
import Image from "next/image"
import { Prisma } from "../../../../../../../generated/prisma"
import { GalleryActions } from "./gallery-actions"
import { getTranslation } from "@/lib/utils/get-translation"

export type GalleryWithRelations = Prisma.GalleryGetPayload<{
    include: {
        translations: true
        media: true
        match: {
            include: {
                opponent: {
                    include: {
                        translations: true
                    }
                }
                tournament: true
            }
        }
    }
}>

export const columns: ColumnDef<GalleryWithRelations>[] = [
    {
        id: "cover",
        header: "Обкладинка",
        cell: ({ row }) => {
            const coverUrl = row.original.coverUrl
            return (
                <div className="h-12 w-20 relative rounded-md overflow-hidden bg-muted/50 shrink-0 flex items-center justify-center group">
                    {coverUrl ? (
                        <Image
                            src={coverUrl}
                            alt="Cover"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 80px"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/50 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/50">
                            <Images className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorFn: (row) => getTranslation(row, "uk")?.title || "Без назви",
        id: "title",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4"
            >
                Назва
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const title = row.getValue("title") as string
            return (
                <div className="font-medium line-clamp-2 min-w-62.5 max-w-100 whitespace-normal pr-4">
                    {title || "Без назви"}
                </div>
            )
        },
    },
    {
        id: "mediaCount",
        header: "Фото",
        cell: ({ row }) => {
            const count = row.original.media?.length ?? 0
            return (
                <Badge
                    variant="secondary"
                    className="text-xs px-2.5 py-0.5 font-medium whitespace-nowrap"
                >
                    {count} фото
                </Badge>
            )
        },
    },
    {
        id: "match",
        header: "Матч",
        cell: ({ row }) => {
            const match = row.original.match
            if (!match) {
                return (
                    <div className="flex items-center gap-1.5 text-muted-foreground/60 text-sm">
                        <Link2Off className="w-3.5 h-3.5" />
                        <span>Без матчу</span>
                    </div>
                )
            }

            const opponent = getTranslation(match.opponent, "uk")?.name ?? "Суперник"
            const date = new Date(match.date).toLocaleDateString("uk-UA", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            const isHome = match.isHomeGame
            const homeScore = match.homeScore
            const awayScore = match.awayScore
            const hasScore = homeScore !== null && awayScore !== null

            return (
                <div className="flex flex-col gap-0.5 whitespace-nowrap">
                    <span className="text-sm font-medium">
                        {isHome ? `Смарагдова Банда - ${opponent}` : `${opponent} - Смарагдова Банда`}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">{date}</span>
                        {hasScore && (
                            <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0 h-4 font-semibold"
                            >
                                {homeScore}:{awayScore}
                            </Badge>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "publishedAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4"
            >
                Дата публікації
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.original.publishedAt)
            return (
                <div className="flex flex-col whitespace-nowrap">
                    <span className="text-sm font-medium">
                        {date.toLocaleDateString("uk-UA")}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                        {date.toLocaleTimeString("uk-UA", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <GalleryActions gallery={row.original} />,
    },
]