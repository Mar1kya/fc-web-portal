"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Newspaper } from "lucide-react"
import Image from "next/image"
import { getTranslation } from "@/lib/utils/get-translation"
import { type PostWithRelations, postTypeTranslations, teamContextTranslations } from "../../_components/columns"
import { TrashActions } from "./trash-actions"

export const trashColumns: ColumnDef<PostWithRelations>[] = [
    {
        id: "media",
        header: "Обкладинка",
        cell: ({ row }) => {
            const mediaUrl = row.original.media?.[0]?.url;
            return (
                <div className="h-12 w-20 relative rounded-md overflow-hidden bg-muted/50 shrink-0 flex items-center justify-center group opacity-50 grayscale">
                    {mediaUrl ? (
                        <Image src={mediaUrl} alt="Cover" fill className="object-cover" sizes="80px" />
                    ) : (
                        <Newspaper className="w-6 h-6 text-muted-foreground/50" strokeWidth={1.5} />
                    )}
                </div>
            )
        },
    },
    {
        accessorFn: (row) => getTranslation(row, "uk")?.title || "",
        id: "title",
        header: "Заголовок",
        cell: ({ row }) => {
            const title = row.getValue("title") as string;
            return <div className="font-medium line-clamp-2 min-w-62.5 max-w-100 whitespace-normal text-muted-foreground">{title || "Без заголовку"}</div>
        }
    },
    {
        accessorKey: "type",
        header: "Категорія",
        cell: ({ row }) => <Badge variant="outline" className="text-xs px-2.5 py-0.5">{postTypeTranslations[row.original.type]}</Badge>,
        filterFn: (row, id, value) => value === "ALL" || row.getValue(id) === value,
    },
    {
        accessorKey: "teamContext",
        header: "Команда",
        cell: ({ row }) => <Badge variant="secondary" className="text-xs px-2.5 py-0.5">{teamContextTranslations[row.original.teamContext]}</Badge>,
        filterFn: (row, id, value) => value === "ALL" || row.getValue(id) === value,
    },
    {
        accessorKey: "deletedAt",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
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
        cell: ({ row }) => <TrashActions post={row.original} />,
    },
]