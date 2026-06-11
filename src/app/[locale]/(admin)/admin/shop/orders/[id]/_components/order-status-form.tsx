"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OrderStatusEnum, PaymentMethodEnum } from "../../../../../../../../../generated/prisma";
import { updateOrderStatus, updateOrderIsPaid } from "@/actions/order";
import { statusColors } from "@/lib/constants";

const statusTranslations: Record<OrderStatusEnum, string> = {
    PENDING: "Очікує",
    PAID: "Оплачено",
    SHIPPED: "Відправлено",
    DELIVERED: "Доставлено",
    CANCELLED: "Скасовано",
};


const allowedTransitions: Record<OrderStatusEnum, OrderStatusEnum[]> = {
    PENDING: [OrderStatusEnum.SHIPPED, OrderStatusEnum.DELIVERED, OrderStatusEnum.CANCELLED],
    PAID: [OrderStatusEnum.SHIPPED, OrderStatusEnum.DELIVERED, OrderStatusEnum.CANCELLED],
    SHIPPED: [OrderStatusEnum.DELIVERED, OrderStatusEnum.CANCELLED],
    DELIVERED: [],
    CANCELLED: [],
};

type OrderStatusFormProps = {
    orderId: string;
    currentStatus: OrderStatusEnum;
    isPaid: boolean;
    paymentMethod: PaymentMethodEnum;
};

export function OrderStatusForm({
    orderId,
    currentStatus,
    isPaid,
    paymentMethod,
}: OrderStatusFormProps) {
    const [status, setStatus] = useState<OrderStatusEnum>(currentStatus);
    const [paidState, setPaidState] = useState(isPaid);
    const [selectValue, setSelectValue] = useState("");
    const [isPendingStatus, startStatusTransition] = useTransition();
    const [isPendingPaid, startPaidTransition] = useTransition();

    const availableStatuses = allowedTransitions[status];
    const isFinal = availableStatuses.length === 0;

    const handleStatusChange = (value: string) => {
        const newStatus = value as OrderStatusEnum;
        startStatusTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                setStatus(newStatus);
                setSelectValue("");
                toast.success(result.message);
            } else {
                setSelectValue("");
                toast.error(result.message);
            }
        });
    };

    const handlePaidToggle = () => {
        const newPaid = !paidState;
        startPaidTransition(async () => {
            const result = await updateOrderIsPaid(orderId, newPaid);
            if (result.success) {
                setPaidState(newPaid);
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
            <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider w-12">
                    Замовл:
                </span>
                <Badge
                    variant="secondary"
                    className={cn(
                        "h-6 text-[10px] font-bold uppercase tracking-wider px-2 rounded-md",
                        statusColors[status]
                    )}
                >
                    {statusTranslations[status]}
                </Badge>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider w-12">
                    Оплата:
                </span>
                <Badge
                    variant="outline"
                    className={cn(
                        "h-6 text-[10px] font-bold uppercase tracking-wider px-2 rounded-md border-none",
                        paidState
                            ? "bg-emerald-600 text-white"
                            : paymentMethod === PaymentMethodEnum.CARD
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-blue-500/10 text-blue-500"
                    )}
                >
                    {paidState
                        ? "Оплачено"
                        : paymentMethod === PaymentMethodEnum.CARD
                        ? "Не оплачено"
                        : "При отриманні"}
                </Badge>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto flex-wrap">
                {!isFinal && (
                    <Select
                        value={selectValue}
                        onValueChange={handleStatusChange}
                        disabled={isPendingStatus || isPendingPaid}
                    >
                        <SelectTrigger className="w-48">
                            {isPendingStatus && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2 shrink-0" />
                            )}
                            <SelectValue placeholder="Змінити статус" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableStatuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {statusTranslations[s]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {status !== OrderStatusEnum.CANCELLED && (
                    <Button
                        variant="outline"
                        className={cn(
                            "gap-2",
                            paidState
                                ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                                : "text-emerald-600 hover:bg-emerald-600/10 hover:text-emerald-700"
                        )}
                        onClick={handlePaidToggle}
                        disabled={isPendingPaid || isPendingStatus}
                    >
                        {isPendingPaid ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : paidState ? (
                            <XCircle className="h-4 w-4" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        {paidState ? "Скасувати оплату" : "Підтвердити оплату"}
                    </Button>
                )}
            </div>
        </div>
    );
}