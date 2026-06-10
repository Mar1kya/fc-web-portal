"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ImageOff } from "lucide-react";
import { ArchiveActions } from "./archive-actions";
import { getTranslation } from "@/lib/utils/get-translation";
import { ProductPlain } from "../../_components/columns";

export const archiveColumns: ColumnDef<ProductPlain>[] = [
    {
        id: "media",
        header: "Обкладинка",
        cell: ({ row }) => {
            const mediaUrl = row.original.media?.[0]?.url;
            return (
                <div className="h-10 w-10 relative rounded-md overflow-hidden bg-muted/50 shrink-0 flex items-center justify-center opacity-60 grayscale">
                    {mediaUrl ? (
                        <Image src={mediaUrl} alt="Cover" fill className="object-cover" sizes="40px" />
                    ) : (
                        <ImageOff className="w-4 h-4 text-muted-foreground/50" />
                    )}
                </div>
            )
        },
    },
    {
        id: "name",
        accessorFn: (row) => getTranslation(row, "uk")?.name || row.slug,
        header: "Назва товару",
        cell: ({ row }) => {
            const name = getTranslation(row.original, "uk")?.name || row.original.slug;
            return <div className="font-medium text-muted-foreground">{name}</div>;
        },
    },
    {
        accessorKey: "deletedAt",
        header: ({ column }) => {
            return (
                <Button 
                    variant="ghost" 
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
                    className="-ml-4 text-muted-foreground"
                >
                    Дата видалення
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            if (!row.original.deletedAt) return null;
            const date = new Date(row.original.deletedAt);
            return (
                <div className="whitespace-nowrap text-sm text-muted-foreground">
                    {date.toLocaleDateString("uk-UA")} о {date.toLocaleTimeString("uk-UA", { hour: '2-digit', minute: '2-digit' })}
                </div>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <div className="flex justify-end"><ArchiveActions product={row.original} /></div>,
    },
];