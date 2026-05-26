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

export default async function OrderPage({ params }: {params: Promise<{ id: string; locale: string }>}) {
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

    const safeAddress = order.address || "";

    const displayData = {
        firstName: isOwner ? order.firstName : maskName(order.firstName),
        lastName: isOwner ? order.lastName : maskName(order.lastName),
        email: isOwner ? order.email : maskEmail(order.email),
        phone: isOwner ? order.phone : maskPhone(order.phone),
        address: isOwner ? safeAddress : maskAddress(safeAddress),
    };

    const isCardPayment = order.paymentMethod === "CARD";
    const showPendingNotice = isCardPayment && !order.isPaid;

    let paymentBadgeText = "";
    let paymentBadgeClass = "";

    if (order.isPaid) {
        paymentBadgeText = t("paid");
        paymentBadgeClass = "bg-emerald-600 hover:bg-emerald-600 text-white";
    } else if (!order.isPaid && isCardPayment) {
        paymentBadgeText = t("notPaid");
        paymentBadgeClass = "bg-amber-500/10 text-amber-500";
    } else {
        paymentBadgeText = t("paymentUponDelivery");
        paymentBadgeClass = "bg-blue-500/10 text-blue-500";
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-4">
            <ClearCartTrigger />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 border-border">
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
                <div className="flex flex-wrap gap-2">
                    <Badge variant={order.status === "CANCELLED" ? "destructive" : "secondary"} className="h-8 font-bold uppercase tracking-wider px-3 bg-emerald-600/10 text-emerald-600 border-none">
                        {t(`statuses.${order.status}`)}
                    </Badge>
                    <Badge variant="outline" className={cn("h-8 font-bold uppercase tracking-wider px-3 border-none", paymentBadgeClass)}>
                        {paymentBadgeText}
                    </Badge>
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