import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { Prisma } from "../../../../../../../generated/prisma";

type OrderWithItems = Prisma.OrderGetPayload<{
    include: {
        orderItems: {
            select: {
                id: true;
                quantity: true;
                fixedPrice: true;
                size: true;
                product: {
                    select: {
                        media: { take: number };
                        translations: true;
                    };
                };
            };
        };
    };
}>;

export default async function OrderHistoryCard({
    order,
    locale
}: {
    order: OrderWithItems;
    locale: string;
}) {
    const t = await getTranslations("ProfilePage.History");
    const tOrder = await getTranslations("Shop.OrderPage");

    const totalAmount = order.orderItems.reduce(
        (acc, item) => acc + (Number(item.fixedPrice) * item.quantity),
        0
    );
    const totalItems = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);

    const allImageUrls = order.orderItems
        .map((item) => item.product.media[0]?.url)
        .filter(Boolean) as string[];
        
    const uniqueImages = Array.from(new Set(allImageUrls));
        
    const displayImages = uniqueImages.slice(0, 3);
    const remainingImages = uniqueImages.length - displayImages.length;

    const isCardPayment = order.paymentMethod === "CARD";
    let paymentBadgeText = "";
    let paymentBadgeClass = "";

    if (order.isPaid) {
        paymentBadgeText = tOrder("paid");
        paymentBadgeClass = "bg-emerald-600/10 text-emerald-600";
    } else if (order.status === "CANCELLED") {
        paymentBadgeText = tOrder(`statuses.CANCELLED`);
        paymentBadgeClass = "bg-destructive/10 text-destructive";
    } else if (isCardPayment) {
        paymentBadgeText = tOrder("notPaid");
        paymentBadgeClass = "bg-amber-500/10 text-amber-500";
    } else {
        paymentBadgeText = tOrder("paymentUponDelivery");
        paymentBadgeClass = "bg-blue-500/10 text-blue-500";
    }

    const needsPayment = !order.isPaid && isCardPayment && order.status !== "CANCELLED";

    return (
        <div className="flex flex-col border border-border/50 bg-muted/10 rounded-xl overflow-hidden hover:border-emerald-600/60 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-border/50 bg-muted/30">
                <div>
                    <h3 className="font-bold uppercase tracking-tight text-lg">
                        #{order.id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString(locale, {
                            day: "numeric", month: "long", year: "numeric"
                        })}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-background/50 p-2.5 sm:px-3 rounded-lg border border-border/50 w-full md:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {tOrder("status")}:
                        </span>
                        <Badge 
                            variant={order.status === "CANCELLED" ? "destructive" : "secondary"} 
                            className={cn(
                                "h-6 text-[10px] font-bold uppercase tracking-wider px-2 border-none rounded-md",
                                order.status !== "CANCELLED" && "bg-emerald-600/10 text-emerald-600"
                            )}
                        >
                            {tOrder(`statuses.${order.status}`)}
                        </Badge>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-border"></div>
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {tOrder("paymentStatus")}:
                        </span>
                        <Badge 
                            variant="outline" 
                            className={cn("h-6 text-[10px] font-bold uppercase tracking-wider px-2 border-none rounded-md", paymentBadgeClass)}
                        >
                            {paymentBadgeText}
                        </Badge>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        {displayImages.map((url, idx) => (
                            <div key={idx} className="relative w-12 h-12 rounded-md border-2 border-background bg-background overflow-hidden shadow-sm">
                                <Image src={url} alt="Product preview" fill className="object-cover object-center" sizes="48px" />
                            </div>
                        ))}
                        {remainingImages > 0 && (
                            <div className="relative w-12 h-12 rounded-md border-2 border-background bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground z-10 shadow-sm">
                                +{remainingImages}
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                        {t("itemsCount", { count: totalItems })}
                    </span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="flex flex-col sm:items-end">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                            {t("total")}
                        </span>
                        <span className="font-bold text-lg">
                            {formatPrice(totalAmount)}
                        </span>
                    </div>
                    <Link 
                        href={`/${locale}/shop/order/${order.id}`}
                        className={cn(
                            buttonVariants({ variant: needsPayment ? "default" : "outline", size: "sm" }),
                            "h-10 px-4 font-bold uppercase tracking-wider"
                        )}
                    >
                        {needsPayment ? t("payNowButton") : t("detailsButton")}
                    </Link>
                </div>
            </div>
        </div>
    );
}