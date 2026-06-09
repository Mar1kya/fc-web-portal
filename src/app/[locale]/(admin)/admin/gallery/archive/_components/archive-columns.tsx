"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Images, Link2Off } from "lucide-react";
import Image from "next/image";
import { Prisma } from "../../../../../../../../generated/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import { GalleryArchiveActions } from "./archive-actions";

export type ArchivedGalleryWithRelations = Prisma.GalleryGetPayload<{
    include: {
        translations: true
        media: true
        match: {
            include: {
                opponent: {
                    include: { translations: true }
                }
            }
        }
    }
}>

export const galleryArchiveColumns: ColumnDef<ArchivedGalleryWithRelations>[] = [
    {
        id: "cover",
        header: "Обкладинка",
        cell: ({ row }) => {
            const coverUrl = row.original.coverUrl;
            return (
                <div className="h-12 w-20 relative rounded-md overflow-hidden bg-muted/50 shrink-0 flex items-center justify-center group opacity-60 grayscale">
                    {coverUrl ? (
                        <Image
                            src={coverUrl}
                            alt="Cover"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 80px"
                        />
                    ) : (
                        <Images className="w-6 h-6 text-muted-foreground/50" strokeWidth={1.5} />
                    )}
                </div>
            );
        },
    },
    {
        accessorFn: (row) => getTranslation(row, "uk")?.title || "Без назви",
        id: "title",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4 text-muted-foreground"
            >
                Назва
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const title = row.getValue("title") as string;
            return (
                <div className="font-medium line-clamp-2 min-w-62.5 max-w-100 whitespace-normal pr-4 opacity-60">
                    {title || "Без назви"}
                </div>
            );
        },
    },
    {
        id: "mediaCount",
        header: "Фото",
        cell: ({ row }) => {
            const count = row.original.media?.length ?? 0;
            return (
                <Badge
                    variant="secondary"
                    className="text-xs px-2.5 py-0.5 font-medium whitespace-nowrap opacity-60"
                >
                    {count} фото
                </Badge>
            );
        },
    },
    {
        id: "match",
        header: "Матч",
        cell: ({ row }) => {
            const match = row.original.match;
            if (!match) {
                return (
                    <div className="flex items-center gap-1.5 text-muted-foreground/40 text-sm">
                        <Link2Off className="w-3.5 h-3.5" />
                        <span>Без матчу</span>
                    </div>
                );
            }

            const opponentName = getTranslation(match.opponent, "uk")?.name ?? "Суперник";
            const date = new Date(match.date).toLocaleDateString("uk-UA", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            const isHome = match.isHomeGame;
            const hasScore = match.homeScore !== null && match.awayScore !== null;

            return (
                <div className="flex flex-col gap-0.5 whitespace-nowrap opacity-60">
                    <span className="text-sm font-medium">
                        {isHome
                            ? `Смарагдова Банда - ${opponentName}`
                            : `${opponentName} - Смарагдова Банда`}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">{date}</span>
                        {hasScore && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 font-semibold">
                                {match.homeScore}:{match.awayScore}
                            </Badge>
                        )}
                    </div>
                </div>
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
                Видалено
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            if (!row.original.deletedAt) return null;
            const date = new Date(row.original.deletedAt);
            return (
                <div className="flex flex-col whitespace-nowrap text-muted-foreground">
                    <span className="text-sm">{date.toLocaleDateString("uk-UA")}</span>
                    <span className="text-xs">
                        {date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end">
                <GalleryArchiveActions gallery={row.original} />
            </div>
        ),
    },
];