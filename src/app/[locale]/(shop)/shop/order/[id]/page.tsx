import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { maskName, maskEmail, maskPhone, maskAddress } from "@/lib/utils/mask-data";
import { verifyGuestOrderToken } from "@/lib/utils/guest-order-token";
import ClearCartTrigger from "./_components/clear-cart-trigger";
import OrderGuestBanner from "./_components/order-guest-banner";
import OrderDetails from "./_components/order-details";
import RetryPaymentButton from "./_components/retry-payment-button";
import { getPaymentBadgeConfig, NON_CANCELLABLE_STATUSES, statusColors } from "@/lib/constants";
import { formatOrderDateTime } from "@/lib/utils/format-date";
import CancelOrderDialog from "./_components/cancel-order-dialog";

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;
    const t = await getTranslations({ locale, namespace: "Shop.OrderPage.Metadata" });
    const shortId = id.slice(-6).toUpperCase();

    return {
        title: t("title", { id: shortId }),
        description: t("description", { id: shortId }),
    };
}

export default async function OrderPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string; locale: string }>;
    searchParams: Promise<{ token?: string }>;
}) {
    const { id, locale } = await params;
    const { token } = await searchParams;
    const t = await getTranslations("Shop.OrderPage");

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            orderItems: {
                include: {
                    product: { include: { translations: true, media: true } }
                }
            }
        }
    });

    if (!order) notFound();

    const session = await auth();
    const isOwner = !!order.userId && session?.user?.id === order.userId;
    const isGuestOwner = !order.userId && verifyGuestOrderToken(order.id, token);

    if (order.userId && !isOwner) notFound();

    const isCardPayment = order.paymentMethod === "CARD";
    let currentStatus = order.status;
    let showRetryButton = false;
    let expiresAt = 0;

    const NON_RETRYABLE = ["CANCELLED", "CANCELLED_REFUND_PENDING"];
    if (!order.isPaid && isCardPayment && !NON_RETRYABLE.includes(currentStatus)) {
        const timeLimitMs = 30 * 60 * 1000;
        // eslint-disable-next-line react-hooks/purity
        const timePassedMs = Date.now() - order.createdAt.getTime();

        if (timePassedMs >= timeLimitMs) {
            currentStatus = "CANCELLED";
        } else {
            showRetryButton = true;
            expiresAt = order.createdAt.getTime() + timeLimitMs;
        }
    }

    const canViewFullDetails = isOwner || isGuestOwner;
    const safeAddress = order.address || "";
    const displayData = {
        firstName: canViewFullDetails ? order.firstName : maskName(order.firstName),
        lastName: canViewFullDetails ? order.lastName : maskName(order.lastName),
        email: canViewFullDetails ? order.email : maskEmail(order.email),
        phone: canViewFullDetails ? order.phone : maskPhone(order.phone),
        address: canViewFullDetails ? safeAddress : maskAddress(safeAddress),
    };

    const showPendingNotice = isCardPayment && !order.isPaid && !NON_RETRYABLE.includes(currentStatus);

    const payment = getPaymentBadgeConfig(
        order.isPaid,
        order.status,
        order.paymentMethod as "CARD" | "COD",
        order.refundedAt,
    );

    const canCancel =
        (isOwner || isGuestOwner) && !NON_CANCELLABLE_STATUSES.includes(currentStatus);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <ClearCartTrigger />
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b pb-6 border-border">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8 text-emerald-600" />
                        {t("title")} #{order.id.slice(-6).toUpperCase()}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {formatOrderDateTime(order.createdAt, locale)}
                    </p>
                </div>
                <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-muted/20 p-3 sm:px-4 rounded-xl border border-border/50 w-full md:w-auto">
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {t("status")}:
                            </span>
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "h-7 font-bold uppercase tracking-wider px-2.5 rounded-md",
                                    statusColors[currentStatus]
                                )}
                            >
                                {t(`statuses.${currentStatus}`)}
                            </Badge>
                        </div>
                        <div className="hidden sm:block w-px h-5 bg-border" />
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {t("paymentStatus")}:
                            </span>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "h-7 font-bold uppercase tracking-wider px-2.5 rounded-md",
                                    payment.className
                                )}
                            >
                                {t(payment.labelKey)}
                            </Badge>
                        </div>
                    </div>
                    {showRetryButton && (
                        <div className="w-full md:w-auto">
                            <RetryPaymentButton orderId={order.id} expiresAt={expiresAt} />
                        </div>
                    )}
                    {canCancel && (
                        <div className="w-full md:w-auto">
                            <CancelOrderDialog orderId={order.id} token={isGuestOwner ? token : undefined} />
                        </div>
                    )}
                </div>
            </div>
            {showPendingNotice && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm font-medium">
                    <Clock className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                    <p>{t("paymentPendingNotice")}</p>
                </div>
            )}
            {!order.userId && !session && (
                <OrderGuestBanner email={displayData.email} />
            )}
            <OrderDetails order={order} displayData={displayData} locale={locale} />
        </div>
    );
}