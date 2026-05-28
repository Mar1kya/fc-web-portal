import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { maskName, maskEmail, maskPhone, maskAddress } from "@/lib/utils/mask-data";
import ClearCartTrigger from "./_components/clear-cart-trigger";
import OrderGuestBanner from "./_components/order-guest-banner";
import OrderDetails from "./_components/order-details";
import RetryPaymentButton from "./_components/retry-payment-button";

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;
    const t = await getTranslations({ locale, namespace: "Shop.OrderPage.Metadata" });
    const shortId = id.slice(-6).toUpperCase();

    return {
        title: t("title", { id: shortId }),
        description: t("description", { id: shortId }),
    };
}

export default async function OrderPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;
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

    if (order.userId && !isOwner) notFound();

    const isCardPayment = order.paymentMethod === "CARD";
    let currentStatus = order.status;
    let showRetryButton = false;
    let expiresAt = 0;

    if (!order.isPaid && isCardPayment && currentStatus !== "CANCELLED") {
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

    const safeAddress = order.address || "";
    const displayData = {
        firstName: isOwner ? order.firstName : maskName(order.firstName),
        lastName: isOwner ? order.lastName : maskName(order.lastName),
        email: isOwner ? order.email : maskEmail(order.email),
        phone: isOwner ? order.phone : maskPhone(order.phone),
        address: isOwner ? safeAddress : maskAddress(safeAddress),
    };

    const showPendingNotice = isCardPayment && !order.isPaid && currentStatus !== "CANCELLED";

    let paymentBadgeText = "";
    let paymentBadgeClass = "";

    if (order.isPaid) {
        paymentBadgeText = t("paid");
        paymentBadgeClass = "bg-emerald-600 hover:bg-emerald-600 text-white";
    } else if (currentStatus === "CANCELLED") {
        paymentBadgeText = t(`statuses.CANCELLED`);
        paymentBadgeClass = "bg-destructive/10 text-destructive";
    } else if (isCardPayment) {
        paymentBadgeText = t("notPaid");
        paymentBadgeClass = "bg-amber-500/10 text-amber-500";
    } else {
        paymentBadgeText = t("paymentUponDelivery");
        paymentBadgeClass = "bg-blue-500/10 text-blue-500";
    }

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
                        {t("placedAt")}: {new Date(order.createdAt).toLocaleDateString(locale, {
                            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                    </p>
                </div>
                <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-muted/20 p-3 sm:px-4 rounded-xl border border-border/50 w-full md:w-auto">
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {t("status")}:
                            </span>
                            <Badge
                                variant={currentStatus === "CANCELLED" ? "destructive" : "secondary"}
                                className={cn(
                                    "h-7 font-bold uppercase tracking-wider px-2.5 border-none rounded-md",
                                    currentStatus !== "CANCELLED" && "bg-emerald-600/10 text-emerald-600"
                                )}
                            >
                                {t(`statuses.${currentStatus}`)}
                            </Badge>
                        </div>
                        <div className="hidden sm:block w-px h-5 bg-border"></div>
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {t("paymentStatus")}:
                            </span>
                            <Badge
                                variant="outline"
                                className={cn("h-7 font-bold uppercase tracking-wider px-2.5 border-none rounded-md", paymentBadgeClass)}
                            >
                                {paymentBadgeText}
                            </Badge>
                        </div>
                    </div>
                    {showRetryButton && (
                        <div className="w-full md:w-auto">
                            <RetryPaymentButton orderId={order.id} expiresAt={expiresAt} />
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