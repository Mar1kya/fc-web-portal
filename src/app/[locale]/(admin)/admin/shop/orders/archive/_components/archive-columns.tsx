"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderPlain, statusTranslations } from "../../_components/columns";
import { OrderStatusEnum, PaymentMethodEnum } from "../../../../../../../../../generated/prisma";
import { getPaymentBadgeConfig, statusColors } from "@/lib/constants";
import { ArchiveActions } from "./archive-actions";

export const archiveColumns: ColumnDef<OrderPlain>[] = [
    {
        id: "client",
        accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email}`,
        header: "Клієнт",
        cell: ({ row }) => {
            const { firstName, lastName, email, phone } = row.original;
            return (
                <div className="flex flex-col gap-0.5 min-w-36">
                    <span className="font-medium text-muted-foreground text-sm">
                        {firstName} {lastName}
                    </span>
                    <span className="text-xs text-muted-foreground/60">{email}</span>
                    <span className="text-xs text-muted-foreground/60">{phone}</span>
                </div>
            );
        },
    },
    {
        id: "totalPrice",
        accessorKey: "totalPrice",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4 text-muted-foreground"
            >
                Сума
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="font-medium text-muted-foreground whitespace-nowrap">
                {row.original.totalPrice} ₴
            </span>
        ),
    },
    {
        id: "status",
        header: "Статуси",
        cell: ({ row }) => {
            const { status, isPaid, paymentMethod } = row.original;
            const payment = getPaymentBadgeConfig(isPaid, status, paymentMethod as "CARD" | "COD");
            return (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-muted-foreground/60 w-12">Замовл:</span>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "h-6 text-[10px] font-bold uppercase tracking-wider px-2 rounded-md opacity-70",
                                statusColors[status as OrderStatusEnum]
                            )}
                        >
                            {statusTranslations[status as OrderStatusEnum]}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-muted-foreground/60 w-12">Оплата:</span>
                        <Badge
                            variant="outline"
                            className={cn(
                                "h-6 text-[10px] font-bold uppercase tracking-wider px-2 rounded-md opacity-70",
                                payment.className
                            )}
                        >
                            {payment.label}
                        </Badge>
                    </div>
                </div>
            );
        },
    },
    {
        id: "paymentMethod",
        accessorKey: "paymentMethod",
        header: "Оплата",
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground/60 whitespace-nowrap">
                {row.original.paymentMethod === PaymentMethodEnum.CARD
                    ? "Картою"
                    : "Накладений платіж"}
            </span>
        ),
    },
    {
        accessorKey: "deletedAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4 text-muted-foreground"
            >
                Дата видалення
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            if (!row.original.deletedAt) return null;
            const date = new Date(row.original.deletedAt);
            return (
                <div className="whitespace-nowrap text-sm text-muted-foreground/60">
                    {date.toLocaleDateString("uk-UA")} о{" "}
                    {date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                </div>
            );
        },
        sortingFn: "datetime",
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end">
                <ArchiveActions order={row.original} />
            </div>
        ),
    },
];