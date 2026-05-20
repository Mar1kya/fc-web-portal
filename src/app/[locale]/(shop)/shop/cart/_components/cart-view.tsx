"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/useCartStore";
import { useStore } from "@/hooks/useStore";
import { getTranslation } from "@/lib/utils/get-translation";
import { formatPrice } from "@/lib/utils";
import { MAX_QTY_PER_ITEM } from "@/lib/constants";

export default function CartView() {
    const t = useTranslations("Shop.CartPage");
    const locale = useLocale();

    const items = useStore(useCartStore, (state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);

    if (items === undefined) {
        return null;
    }

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleDecrease = (cartItemId: string, currentQty: number) => {
        if (currentQty <= 1) {
            removeItem(cartItemId);
            toast.info(t("removedToast"));
        } else {
            updateQuantity(cartItemId, currentQty - 1);
        }
    };

    const handleIncrease = (cartItemId: string, currentQty: number, stock: number) => {
        if (currentQty >= MAX_QTY_PER_ITEM) {
            toast.warning(t("limitError", { max: MAX_QTY_PER_ITEM }));
            return;
        }
        if (currentQty >= stock) {
            toast.warning(t("stockError", { stock }));
            return;
        }
        updateQuantity(cartItemId, currentQty + 1);
    };

    if (items.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-24 px-4 text-center min-h-[60vh]">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-emerald-600/20 blur-2xl rounded-full" />
                    <div className="relative bg-card w-24 h-24 rounded-2xl flex items-center justify-center border border-border/50 shadow-sm">
                        <ShoppingBag className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />
                    </div>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground leading-tight">
                    {t("emptyTitle")}
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto mb-10 text-base md:text-lg leading-relaxed">
                    {t("emptyDescription")}
                </p>
                <Button asChild className="font-semibold">
                    <Link href="/shop" className="inline-flex items-center">
                        {t("continueShopping")}
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight border-b pb-4">
                {t("title")} <span className="text-muted-foreground font-normal text-xl">({totalItems})</span>
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                    {items.map((item) => {
                        const translatedData = getTranslation({ translations: item.translations }, locale);
                        const itemName = translatedData?.name || "";

                        return (
                            <div
                                key={item.cartItemId}
                                className="flex flex-row gap-4 sm:gap-6 p-4 border rounded-xl bg-card transition-all duration-300 hover:border-emerald-600/60 relative group"
                            >
                                <Link
                                    href={`/shop/product/${item.slug}`}
                                    className="relative w-24 sm:w-32 aspect-3/4 rounded-lg overflow-hidden bg-muted/50 border border-border/50 shrink-0 block"
                                >
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={itemName}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 640px) 96px, 128px"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/30 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/40">
                                            <ImageOff className="w-8 h-8" strokeWidth={1.5} />
                                        </div>
                                    )}
                                </Link>
                                <div className="flex flex-col justify-between grow gap-2 py-1">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                        <div className="pr-4">
                                            <Link href={`/shop/product/${item.slug}`} className="font-bold text-base sm:text-lg hover:text-emerald-600 transition-colors line-clamp-2 uppercase tracking-wide">
                                                {itemName}
                                            </Link>
                                            {item.size && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {t("size")}: <span className="font-semibold text-foreground">{item.size}</span>
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-lg sm:text-xl font-black shrink-0 whitespace-nowrap mt-1 sm:mt-0">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-auto pt-4">
                                        <div className="flex items-center border rounded-lg bg-background shadow-sm">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 sm:h-9 w-8 sm:w-9 rounded-r-none text-muted-foreground hover:text-foreground"
                                                onClick={() => handleDecrease(item.cartItemId, item.quantity)}
                                            >
                                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </Button>
                                            <span className="w-8 sm:w-10 text-center font-bold text-sm select-none">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 sm:h-9 w-8 sm:w-9 rounded-l-none text-muted-foreground hover:text-foreground"
                                                onClick={() => handleIncrease(item.cartItemId, item.quantity, item.stock)}
                                            >
                                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </Button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 sm:h-9 w-8 sm:w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                removeItem(item.cartItemId);
                                                toast.info(t("removedToast"));
                                            }}
                                            title={t("removedToast")}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="lg:col-span-4 border rounded-xl p-6 bg-card space-y-6 sticky top-44">
                    <h2 className="text-xl font-extrabold uppercase tracking-tight">{t("summaryTitle")}</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>{t("subtotal")}</span>
                            <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-sm italic">
                            <span>* {t("shippingNotice")}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-baseline pt-2">
                            <span className="text-base font-bold">{t("total")}</span>
                            <span className="text-2xl font-black text-emerald-600">{formatPrice(totalPrice)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                        <Link href="/shop/checkout" className="w-full">
                            <Button className="w-full font-bold uppercase tracking-wider h-12 text-sm cursor-pointer">
                                {t("checkoutBtn")}
                            </Button>
                        </Link>
                        <Link href="/shop" className="w-full">
                            <Button variant="outline" className="w-full font-bold uppercase tracking-wider h-12 text-sm cursor-pointer">
                                {t("continueShopping")}
                            </Button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}