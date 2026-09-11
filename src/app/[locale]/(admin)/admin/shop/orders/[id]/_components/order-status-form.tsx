"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Undo2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { OrderStatusEnum, PaymentMethodEnum } from "../../../../../../../../../generated/prisma";
import {
    updateOrderStatus,
    updateOrderIsPaid,
    cancelOrder,
    markRefundCompleted,
    markStockRestored,
    type ManualOrderStatus,
} from "@/actions/order";
import {
    adminLabels,
    getPaymentBadgeConfig,
    statusColors,
    statusTranslations,
} from "@/lib/constants";

const allowedTransitions: Record<ManualOrderStatus, ManualOrderStatus[]> = {
    PENDING: [OrderStatusEnum.SHIPPED, OrderStatusEnum.DELIVERED],
    PAID: [OrderStatusEnum.SHIPPED, OrderStatusEnum.DELIVERED],
    SHIPPED: [OrderStatusEnum.DELIVERED],
    DELIVERED: [],
};

const SHIPPED_OR_DELIVERED: OrderStatusEnum[] = [
    OrderStatusEnum.SHIPPED,
    OrderStatusEnum.DELIVERED,
];

type OrderStatusFormProps = {
    orderId: string;
    currentStatus: OrderStatusEnum;
    isPaid: boolean;
    paymentMethod: PaymentMethodEnum;
    refundedAt: Date | null;
    stockRestored: boolean;
};

export function OrderStatusForm({
    orderId,
    currentStatus,
    isPaid,
    paymentMethod,
    refundedAt,
    stockRestored,
}: OrderStatusFormProps) {
    const router = useRouter();
    const [status, setStatus] = useState<OrderStatusEnum>(currentStatus);
    const [paidState, setPaidState] = useState(isPaid);
    const [refundedAtState, setRefundedAtState] = useState(refundedAt);
    const [stockRestoredState, setStockRestoredState] = useState(stockRestored);
    const [selectValue, setSelectValue] = useState("");
    const [isPendingStatus, startStatusTransition] = useTransition();
    const [isPendingPaid, startPaidTransition] = useTransition();
    const [isPendingCancel, startCancelTransition] = useTransition();
    const [isPendingStock, startStockTransition] = useTransition();

    const isCancelled =
        status === OrderStatusEnum.CANCELLED ||
        status === OrderStatusEnum.CANCELLED_REFUND_PENDING;

    const availableStatuses = isCancelled
        ? []
        : allowedTransitions[status as ManualOrderStatus] ?? [];
    const isShippedOrDelivered = SHIPPED_OR_DELIVERED.includes(status);

    const showStockRestoreButton = isCancelled && !stockRestoredState;

    const paymentBadge = getPaymentBadgeConfig(
        paidState,
        status,
        paymentMethod,
        refundedAtState,
    );

    const handleStatusChange = (value: string) => {
        const newStatus = value as ManualOrderStatus;
        startStatusTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                setStatus(newStatus);
                setSelectValue("");
                toast.success(result.message);
                router.refresh();
            } else {
                setSelectValue("");
                toast.error(result.message);
                router.refresh();
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
                router.refresh();
            } else {
                toast.error(result.message);
                router.refresh();
            }
        });
    };

    const handleCancel = () => {
        startCancelTransition(async () => {
            const result = await cancelOrder(orderId, "ADMIN");
            if (result?.success) {
                setStatus(
                    isShippedOrDelivered
                        ? OrderStatusEnum.CANCELLED_REFUND_PENDING
                        : OrderStatusEnum.CANCELLED,
                );
                if (!isShippedOrDelivered) {
                    setStockRestoredState(true);
                }
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result?.message ?? "Помилка скасування");
                router.refresh();
            }
        });
    };

    const handleConfirmRefund = () => {
        startCancelTransition(async () => {
            const result = await markRefundCompleted(orderId);
            if (result.success) {
                setStatus(OrderStatusEnum.CANCELLED);
                setPaidState(false);
                setRefundedAtState(new Date());
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.message);
                router.refresh();
            }
        });
    };

    const handleConfirmStockRestored = () => {
        startStockTransition(async () => {
            const result = await markStockRestored(orderId);
            if (result.success) {
                setStockRestoredState(true);
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.message);
                router.refresh();
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
                        "h-6 text-[10px] font-bold uppercase tracking-wider px-2 rounded-md",
                        paymentBadge.className
                    )}
                >
                    {adminLabels[paymentBadge.labelKey] ?? paymentBadge.labelKey}
                </Badge>
            </div>
            {isCancelled && (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider w-12">
                        Склад:
                    </span>
                    <Badge
                        variant="outline"
                        className={cn(
                            "h-6 text-[10px] font-bold uppercase tracking-wider px-2 rounded-md",
                            stockRestoredState
                                ? "bg-emerald-600/10 text-emerald-600 border-emerald-600/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}
                    >
                        {stockRestoredState ? "Повернено" : "Очікує повернення"}
                    </Badge>
                </div>
            )}
            <div className="flex items-center gap-3 sm:ml-auto flex-wrap">
                {!isCancelled && availableStatuses.length > 0 && (
                    <Select
                        value={selectValue}
                        onValueChange={handleStatusChange}
                        disabled={isPendingStatus || isPendingPaid || isPendingCancel}
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
                {!isCancelled && !paidState && paymentMethod === PaymentMethodEnum.COD && (
                    <Button
                        variant="outline"
                        className="gap-2 text-emerald-600 hover:bg-emerald-600/10 hover:text-emerald-700"
                        onClick={handlePaidToggle}
                        disabled={isPendingPaid || isPendingStatus || isPendingCancel}
                    >
                        {isPendingPaid ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        Підтвердити оплату
                    </Button>
                )}
                {!isCancelled && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={isPendingCancel || isPendingStatus || isPendingPaid}
                            >
                                {isPendingCancel ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <XCircle className="h-4 w-4" />
                                )}
                                {isShippedOrDelivered ? "Скасувати / повернення" : "Скасувати замовлення"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {isShippedOrDelivered
                                        ? "Скасувати відправлене замовлення?"
                                        : "Скасувати замовлення?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {isShippedOrDelivered
                                        ? "Замовлення вже відправлене/доставлене. Товар НЕ буде автоматично повернено на склад — поповнюйте вручну лише після фактичного повернення посилки. "
                                        : "Товар буде повернено на склад. "}
                                    {paidState && paymentMethod === PaymentMethodEnum.CARD
                                        ? "Оплата карткою буде повернена клієнту через Stripe автоматично."
                                        : ""}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Відміна</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancel}>
                                    Підтвердити скасування
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                {status === OrderStatusEnum.CANCELLED_REFUND_PENDING && (
                    <Button
                        variant="outline"
                        className="gap-2 text-emerald-600 hover:bg-emerald-600/10 hover:text-emerald-700"
                        onClick={handleConfirmRefund}
                        disabled={isPendingCancel}
                    >
                        {isPendingCancel ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Undo2 className="h-4 w-4" />
                        )}
                        Підтвердити повернення коштів
                    </Button>
                )}
                {showStockRestoreButton && (
                    <Button
                        variant="outline"
                        className="gap-2 text-emerald-600 hover:bg-emerald-600/10 hover:text-emerald-700"
                        onClick={handleConfirmStockRestored}
                        disabled={isPendingStock}
                    >
                        {isPendingStock ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <PackageCheck className="h-4 w-4" />
                        )}
                        Товар повернено на склад
                    </Button>
                )}
            </div>
        </div>
    );
}