"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Eye, Trash2, ArrowUpDown, Newspaper } from "lucide-react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { Prisma, PostType, TeamContext } from "../../../../../../../generated/prisma"
import { getTranslation } from "@/lib/utils/get-translation"

export type PostWithRelations = Prisma.PostGetPayload<{
    include: { translations: true; media: true }
}>

export const postTypeTranslations: Record<PostType, string> = {
    NEWS: "Новина",
    INTERVIEW: "Інтерв'ю",
    STATEMENT: "Офіційно"
};

export const teamContextTranslations: Record<TeamContext, string> = {
    MAIN_TEAM: "Основна команда",
    U19: "U-19",
    ACADEMY: "Академія",
    GENERAL: "Клуб"
};

export const columns: ColumnDef<PostWithRelations>[] = [
    {
        id: "media",
        header: "Обкладинка",
        cell: ({ row }) => {
            const mediaUrl = row.original.media?.[0]?.url;
            return (
                <div className="h-12 w-20 relative rounded-md overflow-hidden bg-muted/50 shrink-0 flex items-center justify-center group">
                    {mediaUrl ? (
                        <Image 
                            src={mediaUrl} 
                            alt="Cover" 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover:scale-105" 
                            sizes="(max-width: 768px) 100vw, 80px"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/50 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/50">
                            <Newspaper className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorFn: (row) => getTranslation(row, "uk")?.title || "",
        id: "title",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                    Заголовок
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const title = row.getValue("title") as string;
            return (
                <div className="font-medium line-clamp-2 min-w-62.5 max-w-100 whitespace-normal pr-4">
                    {title || "Без заголовку"}
                </div>
            )
        }
    },
    {
        accessorKey: "type",
        header: "Категорія",
        cell: ({ row }) => (
            <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-medium whitespace-nowrap">
                {postTypeTranslations[row.original.type]}
            </Badge>
        ),
        filterFn: (row, id, value) => value === "ALL" || row.getValue(id) === value,
    },
    {
        accessorKey: "teamContext",
        header: "Команда",
        cell: ({ row }) => (
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-medium whitespace-nowrap">
                {teamContextTranslations[row.original.teamContext]}
            </Badge>
        ),
        filterFn: (row, id, value) => value === "ALL" || row.getValue(id) === value,
    },
    {
        accessorKey: "isPublished",
        header: "Статус",
        cell: ({ row }) => {
            const isPublished = row.original.isPublished;
            const publishedAt = new Date(row.original.publishedAt);
            const isScheduled = isPublished && publishedAt > new Date();

            if (!isPublished) return <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-medium text-muted-foreground whitespace-nowrap">Чернетка</Badge>
            if (isScheduled) return <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-medium text-amber-500 border-amber-500/50 bg-amber-500/10 whitespace-nowrap">Заплановано</Badge>
            return <Badge variant="default" className="text-xs px-2.5 py-0.5 font-medium bg-emerald-600 hover:bg-emerald-600 whitespace-nowrap">Опубліковано</Badge>
        },
        filterFn: (row, id, value) => {
            if (value === "ALL") return true;
            if (value === "PUBLISHED") return row.original.isPublished && new Date(row.original.publishedAt) <= new Date();
            if (value === "DRAFT") return !row.original.isPublished;
            if (value === "SCHEDULED") return row.original.isPublished && new Date(row.original.publishedAt) > new Date();
            return true;
        }
    },
    {
        accessorKey: "publishedAt",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                    Дата публікації
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.original.publishedAt);
            return (
                <div className="flex flex-col whitespace-nowrap">
                    <span className="text-sm font-medium">{date.toLocaleDateString("uk-UA")}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                        {date.toLocaleTimeString("uk-UA", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const post = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Відкрити меню</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Дії</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/news/${post.slug}`} target="_blank" className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Оглянути
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/news/${post.id}/edit`} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                Редагувати
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Видалити
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]