"use client"

import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTranslations, useLocale } from "next-intl"
import { Loader2, ShoppingBag, ImageOff } from "lucide-react"
import Image from "next/image"
import { getTranslation } from "@/lib/utils/get-translation"
import { CartItem } from "@/store/useCartStore"

type CheckoutSummaryProps = {
    cartItems: CartItem[];
    totalPrice: number;
    isPending: boolean;
};

export default function CheckoutSummary({ cartItems, totalPrice, isPending }: CheckoutSummaryProps) {
    const t = useTranslations("Shop.CheckoutPage");
    const locale = useLocale();

    return (
        <div className="lg:col-span-4 border border-border/50 shadow-sm rounded-xl bg-card lg:sticky lg:top-44 overflow-hidden">
            <div className="p-6 border-b border-border/50">
                <h2 className="text-xl font-extrabold uppercase tracking-tight mb-4">{t("Summary.title")}</h2>
                <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                    {cartItems.map(item => {
                        const translatedData = getTranslation({ translations: item.translations }, locale);
                        const itemName = translatedData?.name || "";
                        
                        return (
                            <div key={item.cartItemId} className="flex gap-3 items-start">
                                <div className="relative w-16 h-20 rounded-md overflow-hidden bg-muted/50 border border-border/50 shrink-0">
                                    {item.image ? (
                                        <Image src={item.image} alt={itemName} fill className="object-cover" sizes="64px" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                                            <ImageOff className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 py-0.5">
                                    <span className="text-sm font-semibold line-clamp-2 leading-tight">{itemName}</span>
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                                        {item.size && <span>{t("Summary.size")}: {item.size}</span>}
                                        {item.size && <span>•</span>}
                                        <span>{t("Summary.qty")}: {item.quantity}</span>
                                    </div>
                                    {(item.customName || item.customNumber) && (
                                        <div className="text-[10px] font-bold text-emerald-600 uppercase mt-1.5 bg-emerald-600/10 w-fit px-1.5 py-0.5 rounded-sm border border-emerald-600/20 tracking-wider">
                                            {item.customName} {item.customNumber && `#${item.customNumber}`}
                                        </div>
                                    )}
                                    <span className="text-sm font-bold mt-1.5 text-foreground">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between text-muted-foreground text-sm">
                    <span>{t("Summary.subtotal")}</span>
                    <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs italic">
                    <span>* {t("Summary.shippingNotice")}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-baseline">
                    <span className="text-xl font-bold">{t("Summary.total")}</span>
                    <span className="text-2xl font-black text-emerald-600">{formatPrice(totalPrice)}</span>
                </div>
                <div className="pt-2">
                    <Button 
                        type="submit" 
                        variant="default"
                        size="lg"
                        disabled={isPending || cartItems.length === 0} 
                        className="w-full h-14 font-bold uppercase tracking-wider text-base transition-all"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {t("Form.processing")}
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                {t("Form.submitButton")}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}