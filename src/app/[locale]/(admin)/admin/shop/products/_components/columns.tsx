"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslation } from "@/lib/utils/get-translation";
import { ProductTranslation, Category, CategoryTranslation, Media, ProductVariant } from "../../../../../../../../generated/prisma";
import { ProductActions } from "./product-actions";

export type ProductPlain = {
    id: string;
    slug: string;
    price: number;
    salePrice: number | null;
    isOnSale: boolean;
    isFeatured: boolean;
    isArchived: boolean;
    deletedAt: Date | null;
    translations: ProductTranslation[];
    category: Category & { translations: CategoryTranslation[] };
    media: Media[];
    variants: ProductVariant[];
};

export const columns: ColumnDef<ProductPlain>[] = [
    {
        id: "media",
        header: "Обкладинка",
        cell: ({ row }) => {
            const mediaUrl = row.original.media?.[0]?.url;
            return (
                <div className="h-12 w-12 sm:w-16 relative rounded-md overflow-hidden bg-muted/50 shrink-0 flex items-center justify-center group border">
                    {mediaUrl ? (
                        <Image
                            src={mediaUrl}
                            alt="Cover"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="64px"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/50 transition-transform duration-500 group-hover:scale-100">
                            <ImageOff className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        id: "name",
        accessorFn: (row) => getTranslation(row, "uk")?.name || row.slug,
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                    Назва товару
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const product = row.original;
            const name = getTranslation(product, "uk")?.name || product.slug;
            const categoryName = getTranslation(product.category, "uk")?.name || product.category.slug;

            return (
                <div className="flex flex-col">
                    <span className="font-medium text-base truncate max-w-37.5 sm:max-w-62.5" title={name}>{name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-37.5 sm:max-w-62.5" title={categoryName}>{categoryName}</span>
                </div>
            );
        },
    },
    {
        id: "price",
        accessorFn: (row) => row.isOnSale && row.salePrice ? row.salePrice : row.price,
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                    Ціна
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const product = row.original;

            return (
                <div className="flex flex-col">
                    {product.isOnSale && product.salePrice ? (
                        <>
                            <span className="font-bold text-red-500">{product.salePrice} ₴</span>
                            <span className="text-xs text-muted-foreground line-through">{product.price} ₴</span>
                        </>
                    ) : (
                        <span className="font-medium">{product.price} ₴</span>
                    )}
                </div>
            );
        },
    },
    {
        id: "stock",
        accessorFn: (row) => row.variants.reduce((acc, variant) => acc + variant.stock, 0),
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                    Залишок
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const totalStock = Number(row.getValue("stock"));

            if (totalStock === 0) {
                return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 whitespace-nowrap">Немає в наявності</Badge>;
            }
            if (totalStock < 5) {
                return <Badge variant="outline" className="text-amber-500 border-amber-500/50 bg-amber-500/10 whitespace-nowrap">{totalStock} шт.</Badge>;
            }

            return <span className="font-medium whitespace-nowrap">{totalStock} шт.</span>;
        },
    },
    {
        id: "status",
        header: "Статус",
        cell: ({ row }) => {
            const { isFeatured, isOnSale, isArchived } = row.original;
            return (
                <div className="flex gap-1 flex-wrap w-22.5">
                    {isArchived && <Badge variant={"outline"}>Архівний</Badge>}
                    {isFeatured && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-500 hover:bg-emerald-600">Топ продажу</Badge>}
                    {isOnSale && <Badge className="bg-red-500 hover:bg-red-600 text-[10px] px-1.5 py-0 text-white">Акція</Badge>}
                    {!isFeatured && !isOnSale && <span className="text-muted-foreground text-xs">-</span>}
                </div>
            );
        },
        filterFn: (row, id, value) => {
            if (!value || value === "ALL") return true;
            const product = row.original;
            if (value === "SALE") return product.isOnSale;
            if (value === "FEATURED") return product.isFeatured;
            if (value === "NORMAL") return !product.isOnSale && !product.isFeatured;

            return true;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <div className="flex justify-end"><ProductActions product={row.original} /></div>,
    },
];