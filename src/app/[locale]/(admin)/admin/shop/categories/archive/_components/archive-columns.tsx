"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { ArchiveActions } from "./archive-actions";
import { getTranslation } from "@/lib/utils/get-translation";
import { CategoryWithRelations } from "../../_components/columns";

export const archiveColumns: ColumnDef<CategoryWithRelations>[] = [
    {
        id: "name",
        accessorFn: (row) => getTranslation(row, "uk")?.name || row.slug,
        header: "Назва категорії",
        cell: ({ row }) => {
            const name = getTranslation(row.original, "uk")?.name || row.original.slug;
            return <div className="font-medium text-muted-foreground">{name}</div>;
        },
    },
    {
        id: "productsCount",
        header: "Товарів у категорії",
        cell: ({ row }) => {
            const count = row.original._count.products;
            return <div className="text-muted-foreground/60">{count} шт.</div>;
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
        cell: ({ row }) => <ArchiveActions category={row.original} />,
    },
];