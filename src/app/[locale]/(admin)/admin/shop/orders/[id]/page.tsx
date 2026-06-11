import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Banknote, Truck, User, ImageOff, Package } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusForm } from "./_components/order-status-form";

export const metadata = {
    title: "Деталі замовлення",
};

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id, deletedAt: null },
        include: {
            orderItems: {
                include: {
                    product: {
                        include: {
                            translations: { where: { language: "uk" } },
                            media: { take: 1 },
                        },
                    },
                },
            },
        },
    });

    if (!order) notFound();

    const isCardPayment = order.paymentMethod === "CARD";
    const address = [order.address, order.postalCode].filter(Boolean).join(", ");

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-3xl font-bold tracking-tight">Замовлення</h2>
                    </div>
                    <p className="text-muted-foreground text-sm font-mono">{order.id}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("uk-UA", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/shop/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до замовлень
                    </Link>
                </Button>
            </div>
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-black uppercase text-muted-foreground tracking-wider">
                        Управління замовленням
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <OrderStatusForm
                        orderId={order.id}
                        currentStatus={order.status}
                        isPaid={order.isPaid}
                        paymentMethod={order.paymentMethod}
                    />
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-black uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-600" />
                            Отримувач
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm font-medium space-y-1">
                        <p className="text-base font-bold">
                            {order.firstName} {order.lastName}
                        </p>
                        <p className="text-muted-foreground">{order.email}</p>
                        <p className="text-muted-foreground">{order.phone}</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-black uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                            <Truck className="w-4 h-4 text-emerald-600" />
                            Адреса доставки
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm font-medium space-y-1">
                        <p className="text-base font-bold">{order.city}</p>
                        {address && (
                            <p className="text-muted-foreground leading-snug">{address}</p>
                        )}
                    </CardContent>
                </Card>
                <Card className="border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-black uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                            {isCardPayment ? (
                                <CreditCard className="w-4 h-4 text-emerald-600" />
                            ) : (
                                <Banknote className="w-4 h-4 text-emerald-600" />
                            )}
                            Спосіб оплати
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm font-medium space-y-1">
                        <p className="text-base font-bold leading-tight">
                            {isCardPayment ? "Оплата карткою" : "Накладений платіж"}
                        </p>
                        <p className="text-muted-foreground">
                            {order.isPaid ? "Оплачено" : "Очікує оплати"}
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-lg font-extrabold uppercase tracking-tight">
                        Товари
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {order.orderItems.map((item) => {
                            const name =
                                item.product.translations[0]?.name ?? "Товар";
                            const image = item.product.media[0]?.url ?? null;

                            return (
                                <div key={item.id} className="p-6 flex gap-4 items-start">
                                    <div className="relative w-16 h-20 rounded-md overflow-hidden bg-muted/50 border shrink-0">
                                        {image ? (
                                            <Image
                                                src={image}
                                                alt={name}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                                                <ImageOff className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                                            {name}
                                        </h4>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5 font-medium">
                                            {item.size && <span>Розмір: {item.size}</span>}
                                            {item.size && <span>•</span>}
                                            <span>Кількість: {item.quantity}</span>
                                        </div>
                                        {(item.customName || item.customNumber) && (
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase mt-2 bg-emerald-600/10 w-fit px-1.5 py-0.5 rounded-sm border border-emerald-600/20 tracking-wider">
                                                {item.customName}{" "}
                                                {item.customNumber && `#${item.customNumber}`}
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
                                <span>Сума товарів</span>
                                <span className="text-foreground">
                                    {formatPrice(Number(order.totalPrice))}
                                </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Доставка</span>
                                <span className="text-xs italic text-foreground/70">
                                    За тарифами перевізника
                                </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-baseline">
                                <span className="text-base font-bold text-foreground">
                                    Разом
                                </span>
                                <span className="text-2xl font-black text-emerald-600">
                                    {formatPrice(Number(order.totalPrice))}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}