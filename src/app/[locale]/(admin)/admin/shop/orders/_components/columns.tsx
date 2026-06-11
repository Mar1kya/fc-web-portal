"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { OrderStatusEnum, PaymentMethodEnum } from "../../../../../../../../generated/prisma";
import { OrderActions } from "./order-actions";


export type OrderItemPlain = {
    id: string;
    quantity: number;
    fixedPrice: number;
    size: string | null;
    customName: string | null;
    customNumber: string | null;
    product: {
        translations: { language: string; name: string }[];
    };
};

export type OrderPlain = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    status: OrderStatusEnum;
    isPaid: boolean;
    totalPrice: number;
    paymentMethod: PaymentMethodEnum;
    createdAt: Date;
    deletedAt: Date | null;
    orderItems: OrderItemPlain[];
};

export const statusTranslations: Record<OrderStatusEnum, string> = {
    PENDING: "Очікує",
    PAID: "Оплачено",
    SHIPPED: "Відправлено",
    DELIVERED: "Доставлено",
    CANCELLED: "Скасовано",
};

const statusColors: Record<OrderStatusEnum, string> = {
    PENDING: "bg-amber-500/10 text-amber-500 border-none",
    PAID: "bg-emerald-600/10 text-emerald-600 border-none",
    SHIPPED: "bg-blue-500/10 text-blue-500 border-none",
    DELIVERED: "bg-emerald-600/10 text-emerald-600 border-none",
    CANCELLED: "bg-destructive/10 text-destructive border-none",
};


function getPaymentBadge(isPaid: boolean, status: OrderStatusEnum, paymentMethod: PaymentMethodEnum) {
    if (isPaid) {
        return { label: "Оплачено", className: "bg-emerald-600 hover:bg-emerald-600 text-white border-none" };
    }
    if (status === OrderStatusEnum.CANCELLED) {
        return { label: "Скасовано", className: "bg-destructive/10 text-destructive border-none" };
    }
    if (paymentMethod === PaymentMethodEnum.CARD) {
        return { label: "Не оплачено", className: "bg-amber-500/10 text-amber-500 border-none" };
    }
    return { label: "Оплата при отриманні", className: "bg-blue-500/10 text-blue-500 border-none" };
}


export const columns: ColumnDef<OrderPlain>[] = [
    {
        id: "client",
        accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email} ${row.phone}`,
        header: "Клієнт",
        cell: ({ row }) => {
            const { firstName, lastName, email, phone } = row.original;
            return (
                <div className="flex flex-col gap-0.5 min-w-36">
                    <span className="font-medium whitespace-nowrap">{firstName} {lastName}</span>
                    <span className="text-xs text-muted-foreground">{email}</span>
                    <span className="text-xs text-muted-foreground">{phone}</span>
                </div>
            );
        },
    },
    {
        id: "items",
        accessorFn: (row) =>
            row.orderItems
                .map((item) => item.product.translations.find((t) => t.language === "uk")?.name ?? "")
                .join(" "),
        header: "Товари",
        cell: ({ row }) => {
            const items = row.original.orderItems;
            return (
                <div className="flex flex-col gap-3 max-w-50">
                    {items.map((item) => {
                        const name =
                            item.product.translations.find((t) => t.language === "uk")?.name ?? "Товар";
                        return (
                            <div key={item.id} className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground truncate" title={name}>
                                    {item.quantity}x {name} ({item.size})
                                </span>
                                {(item.customName || item.customNumber) && (
                                    <div className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-600/10 w-fit px-1.5 py-0.5 rounded-sm border border-emerald-600/20 tracking-wider">
                                        {item.customName} {item.customNumber && `#${item.customNumber}`}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        id: "totalPrice",
        accessorKey: "totalPrice",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4"
            >
                Сума
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="font-medium whitespace-nowrap">{row.original.totalPrice} ₴</span>
        ),
    },
    {
        id: "status",
        accessorKey: "status",
        header: "Статуси",
        cell: ({ row }) => {
            const { status, isPaid, paymentMethod } = row.original;
            const payment = getPaymentBadge(isPaid, status, paymentMethod);

            return (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-muted-foreground w-12">Замовл:</span>
                        <Badge
                            variant={status === OrderStatusEnum.CANCELLED ? "destructive" : "secondary"}
                            className={cn(
                                "h-6 text-[10px] font-bold uppercase tracking-wider px-2 rounded-md",
                                statusColors[status]
                            )}
                        >
                            {statusTranslations[status]}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-muted-foreground w-12">Оплата:</span>
                        <Badge
                            variant="outline"
                            className={cn(
                                "h-6 text-[10px] font-bold uppercase tracking-wider px-2 rounded-md",
                                payment.className
                            )}
                        >
                            {payment.label}
                        </Badge>
                    </div>
                </div>
            );
        },
        filterFn: (row, _columnId, value) => {
            if (!value || value === "ALL") return true;
            return row.original.status === value;
        },
    },
    {
        id: "isPaid",
        accessorKey: "isPaid",
        header: () => null,
        cell: () => null,
        enableHiding: true,
        filterFn: (row, _columnId, value) => {
            if (!value || value === "ALL") return true;
            if (value === "PAID") return row.original.isPaid === true;
            if (value === "UNPAID") return row.original.isPaid === false;
            return true;
        },
    },
    {
        id: "paymentMethod",
        accessorKey: "paymentMethod",
        header: () => null,
        cell: () => null,
        enableHiding: true,
        filterFn: (row, _columnId, value) => {
            if (!value || value === "ALL") return true;
            return row.original.paymentMethod === value;
        },
    },
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4"
            >
                Дата
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt);
            return (
                <div className="flex flex-col gap-0.5 whitespace-nowrap">
                    <span className="text-sm">
                        {date.toLocaleDateString("uk-UA", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
            );
        },
        sortingFn: "datetime",
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <OrderActions order={row.original} />
        ),
    },
];