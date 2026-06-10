"use client";

import { ColumnDef } from "@tanstack/react-table";
import { getTranslation } from "@/lib/utils/get-translation";
import { Category, CategoryTranslation } from "../../../../../../../../generated/prisma";
import { CategoryActions } from "./category-actions";

export type CategoryWithRelations = Category & {
    translations: CategoryTranslation[];
    _count: {
        products: number;
    };
};

export const columns: ColumnDef<CategoryWithRelations>[] = [
    {
        id: "name",
        accessorFn: (row) => getTranslation(row, "uk")?.name || row.slug,
        header: "Назва категорії",
        cell: ({ row }) => {
            const name = getTranslation(row.original, "uk")?.name || row.original.slug;
            return <div className="font-medium text-base">{name}</div>;
        },
    },
    {
        id: "productsCount",
        header: "Кількість товарів",
        cell: ({ row }) => {
            const count = row.original._count.products;
            return <div className="text-muted-foreground">{count} шт.</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <CategoryActions category={row.original} />,
    },
];