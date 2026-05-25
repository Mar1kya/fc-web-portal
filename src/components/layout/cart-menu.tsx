"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { ShoppingBasket, Trash2, ImageOff } from "lucide-react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/useCartStore"
import { useStore } from "@/hooks/useStore"
import { getTranslation } from "@/lib/utils/get-translation"
import { getCurrencySymbol } from "@/lib/utils"

export default function CartMenu() {
    const t = useTranslations("Header.CartMenu");
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const currencySymbol = getCurrencySymbol();
    const items = useStore(useCartStore, (state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);

    useEffect(() => {
        setMounted(true);
    }, []);

   if (!mounted || items === undefined) {
        return (
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg">
                <ShoppingBasket className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </Button>
        );
    }

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-8 h-8 rounded-lg hover:text-emerald-600 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                >
                    <ShoppingBasket className="w-5 h-5 sm:w-6 sm:h-6" />
                    {totalItems > 0 && (
                        <Badge
                            variant="default"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-emerald-600 hover:bg-emerald-600 border-none"
                        >
                            {totalItems}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96 p-2">
                <DropdownMenuLabel className="font-semibold text-lg p-2 flex justify-between items-center">
                    <span>{t("title")}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                        {totalItems} {t("items")}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {items.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                        {t("emptyCart")}
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex flex-col gap-4 p-2">
                            {items.map((item) => {
                                const translatedData = getTranslation({ translations: item.translations }, locale)
                                const itemName = translatedData?.name || ""

                                return (
                                    <div key={item.cartItemId} className="flex gap-3 items-center group relative">
                                        <Link
                                            href={`/shop/product/${item.slug}`}
                                            className="flex gap-3 items-center grow hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="relative w-14 h-16 rounded-md overflow-hidden bg-muted/50 border border-border/50 shrink-0">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={itemName}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                        sizes="56px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/30 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/40">
                                                        <ImageOff className="w-6 h-6" strokeWidth={1.5} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col grow">
                                                <h4 className="text-sm font-semibold line-clamp-1 hover:text-emerald-600">{itemName}</h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    {item.size && <span>{t("size")}: {item.size}</span>}
                                                    {item.size && <span>•</span>}
                                                    <span>{t("qty")}: {item.quantity}</span>
                                                </div>
                                                {(item.customName || item.customNumber) && (
                                                    <div className="text-[10px] font-bold text-emerald-600 uppercase mt-1 bg-emerald-600/10 w-fit px-1.5 py-0.5 rounded-sm">
                                                        {item.customName} {item.customNumber && `#${item.customNumber}`}
                                                    </div>
                                                )}

                                                <span className="text-sm font-bold mt-1">{item.price * item.quantity} {currencySymbol}</span>
                                            </div>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeItem(item.cartItemId);
                                            }}
                                            title={t("remove")}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
                {items.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="mt-2" />
                        <div className="p-2 flex justify-between items-center font-bold text-lg">
                            <span>{t("total")}:</span>
                            <span className="text-emerald-600">{totalPrice} {currencySymbol}</span>
                        </div>
                        <div className="p-2 pt-0 flex flex-col gap-2 mt-2">
                            <Link
                                href="/shop/cart"
                                className="w-full block"
                                onClick={() => setIsOpen(false)}
                            >
                                <Button variant="outline" className="w-full cursor-pointer">
                                    {t("viewCart")}
                                </Button>
                            </Link>
                            <Link
                                href="/shop/checkout"
                                className="w-full block"
                                onClick={() => setIsOpen(false)}
                            >
                                <Button variant="default" className="w-full cursor-pointer">
                                    {t("checkout")}
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}