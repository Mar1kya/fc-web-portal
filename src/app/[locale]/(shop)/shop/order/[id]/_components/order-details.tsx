import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Banknote, Truck, User, ImageOff } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { getTranslation } from "@/lib/utils/get-translation";
import { Prisma } from "../../../../../../../../generated/prisma";

export type OrderWithItems = Prisma.OrderGetPayload<{
    include: {
        orderItems: {
            include: { product: { include: { translations: true, media: true } } }
        }
    }
}>;

type OrderDetailsProps = {
    order: OrderWithItems;
    displayData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
    };
    locale: string;
};

export default async function OrderDetails({ order, displayData, locale }: OrderDetailsProps) {
    const t = await getTranslations("Shop.OrderPage");
    const tSummary = await getTranslations("Shop.CheckoutPage.Summary");
    const isCardPayment = order.paymentMethod === "CARD";

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-black uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-600" />
                            {t("recipient")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm font-medium space-y-1">
                        <p className="text-base font-bold">{displayData.firstName} {displayData.lastName}</p>
                        <p className="text-muted-foreground">{displayData.email}</p>
                        <p className="text-muted-foreground">{displayData.phone}</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-black uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                            <Truck className="w-4 h-4 text-emerald-600" />
                            {t("deliveryAddress")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm font-medium space-y-1">
                        <p className="text-base font-bold">{order.city}</p>
                        <p className="text-muted-foreground leading-snug">{displayData.address}</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-black uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                            {isCardPayment ? <CreditCard className="w-4 h-4 text-emerald-600" /> : <Banknote className="w-4 h-4 text-emerald-600" />}
                            {t("paymentMethod")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm font-medium space-y-1">
                        <p className="text-base font-bold leading-tight">
                            {isCardPayment ? t("paymentCard") : t("paymentCOD")}
                        </p>
                        <p className="text-muted-foreground">
                            {order.isPaid ? t("paymentSuccess") : t("paymentWaiting")}
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-lg font-extrabold uppercase tracking-tight">{t("items")}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {order.orderItems.map((item) => {
                            const translatedData = getTranslation({ translations: item.product.translations }, locale);
                            const itemName = translatedData?.name || "Товар Emerald Gang";
                            const productImage = item.product.media?.[0]?.url || null;

                            return (
                                <div key={item.id} className="p-6 flex gap-4 items-start">
                                    <div className="relative w-16 h-20 rounded-md overflow-hidden bg-muted/50 border shrink-0">
                                        {productImage ? (
                                            <Image src={productImage} alt={itemName} fill className="object-cover" sizes="64px" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                                                <ImageOff className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">{itemName}</h4>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5 font-medium">
                                            {item.size && <span>{tSummary("size")}: {item.size}</span>}
                                            {item.size && <span>•</span>}
                                            <span>{tSummary("qty")}: {item.quantity}</span>
                                        </div>
                                        {(item.customName || item.customNumber) && (
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase mt-2 bg-emerald-600/10 w-fit px-1.5 py-0.5 rounded-sm border border-emerald-600/20 tracking-wider">
                                                {item.customName} {item.customNumber && `#${item.customNumber}`}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm font-black text-foreground shrink-0 text-right">
                                        {formatPrice(Number(item.fixedPrice) * item.quantity)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-6 bg-card border-t border-border/50">
                        <div className="max-w-sm ml-auto space-y-3 text-sm font-medium">
                            <div className="flex justify-between text-muted-foreground">
                                <span>{tSummary("subtotal")}</span>
                                <span className="text-foreground">{formatPrice(Number(order.totalPrice))}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>{tSummary("shippingNotice")}</span>
                                <span className="text-xs italic text-foreground/70">✔</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-baseline">
                                <span className="text-base font-bold text-foreground">{tSummary("total")}</span>
                                <span className="text-2xl font-black text-emerald-600">{formatPrice(Number(order.totalPrice))}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}