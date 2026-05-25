"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAX_QTY_PER_ITEM } from "@/lib/constants";
import H1 from "@/components/ui/heading";
import PlayerJerseyGallery from "./player-jersey-gallery";
import { ProductData, useProductForm, Variant } from "@/hooks/useProductForm";

type FormattedProduct = ProductData & {
    matchType: string | null;
    title: string;
    variants: Variant[];
};

type PlayerJerseyFormProps = {
    player: { id: string; slug: string; name: string; number: number; avatar: string | null };
    products: FormattedProduct[];
};

export default function PlayerJerseyForm({ player, products }: PlayerJerseyFormProps) {
    const tLocal = useTranslations("Shop.PlayerJerseyPage");
    const [activeProduct, setActiveProduct] = useState<FormattedProduct>(products[0]);
    const { state, actions, t } = useProductForm(
        activeProduct,
        activeProduct.variants,
        player.name,
        String(player.number)
    );

    const handleProductChange = (product: FormattedProduct) => {
        setActiveProduct(product);
        actions.handleSizeSelect("", 0);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7">
                <PlayerJerseyGallery
                    player={player}
                    activeProductImage={activeProduct.image}
                    activeProductTitle={activeProduct.title}
                    activeProductSlug={activeProduct.slug}
                    isOutOfStock={state.isGlobalOutOfStock}
                />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-6 lg:top-24">
                <div className="flex flex-col gap-4 border-b border-border pb-6">
                    <H1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase leading-none">
                        {activeProduct.title}
                    </H1>
                    <div className="flex items-center gap-3">
                        <Badge variant={state.isGlobalOutOfStock ? "secondary" : "outline"} className={cn(state.isGlobalOutOfStock ? "" : "text-emerald-600 border-emerald-600/30 bg-emerald-600/10")}>
                            {state.isGlobalOutOfStock ? t("outOfStock") : t("inStock")}
                        </Badge>
                        {activeProduct.sku && <span className="text-sm text-muted-foreground">{t("sku")}: {activeProduct.sku}</span>}
                    </div>
                    <div className="flex items-baseline gap-3 mt-2">
                        {activeProduct.isOnSale && activeProduct.salePrice ? (
                            <>
                                <span className="text-3xl font-extrabold text-red-500">{formatPrice(state.currentPrice)}</span>
                                <span className="text-lg font-medium text-muted-foreground line-through">{formatPrice(activeProduct.price)}</span>
                                <Badge className="bg-red-500 hover:bg-red-600">-{state.discountPercentage}%</Badge>
                            </>
                        ) : (
                            <span className="text-3xl font-extrabold text-foreground">{formatPrice(state.currentPrice)}</span>
                        )}
                    </div>
                </div>
                {products.length > 1 && (
                    <div className="flex flex-col gap-3">
                        <span className="text-sm font-semibold uppercase tracking-wider">{tLocal("selectType")}</span>
                        <div className="flex flex-wrap gap-2">
                            {products.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleProductChange(p)}
                                    className={cn(
                                        "h-10 px-4 rounded-md border text-sm font-medium transition-all relative overflow-hidden uppercase",
                                        activeProduct.id === p.id
                                            ? "border-emerald-600 bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-600"
                                            : "border-border hover:border-emerald-600"
                                    )}
                                >
                                    {p.matchType || tLocal("jersey")}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex flex-col gap-3">
                    <span className="text-sm font-semibold uppercase tracking-wider">{t("size")}</span>
                    <div className="flex flex-wrap gap-2">
                        {activeProduct.variants.map((v) => {
                            const totalPhysicalVariantInCart = state.cartItems
                                .filter(i => i.variantId === v.id)
                                .reduce((sum, i) => sum + i.quantity, 0);

                            const cartItemId = `${v.id}-${player.name}-${player.number}`;
                            const exactItemQuantityInCart = state.cartItems.find(i => i.cartItemId === cartItemId)?.quantity || 0;

                            const isVariantMaxedOut =
                                totalPhysicalVariantInCart >= v.stock ||
                                exactItemQuantityInCart >= MAX_QTY_PER_ITEM;

                            return (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => actions.handleSizeSelect(v.size, v.stock)}
                                    disabled={v.stock <= 0}
                                    className={cn(
                                        "h-10 px-4 rounded-md border text-sm font-medium transition-all relative overflow-hidden",
                                        v.stock <= 0 ? "opacity-50 cursor-not-allowed bg-muted border-border" :
                                            state.selectedSize === v.size ? "border-emerald-600 bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-600" : "border-border hover:border-emerald-600"
                                    )}
                                >
                                    {v.size}
                                    {v.stock <= 0 && <div className="absolute top-1/2 left-0 w-full h-px bg-muted-foreground/40 -rotate-12" />}

                                    {v.stock > 0 && isVariantMaxedOut && state.selectedSize !== v.size && (
                                        <span className="absolute bottom-0 right-0.5 text-[8px] text-emerald-600 font-bold">MAX</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center justify-between py-4 border-y border-border">
                    <span className="text-sm font-semibold uppercase tracking-wider">{t("quantity")}</span>
                    <Select
                        value={state.isLimitReached ? "" : state.quantity}
                        onValueChange={actions.setQuantity}
                        disabled={!state.selectedSize || state.isGlobalOutOfStock || state.isLimitReached}
                    >
                        <SelectTrigger className="w-24 h-10 font-medium focus:ring-emerald-600">
                            <SelectValue placeholder={state.isLimitReached ? "Max" : "1"} />
                        </SelectTrigger>
                        <SelectContent>
                            {state.maxAllowedToAdd > 0 && Array.from({ length: state.maxAllowedToAdd }, (_, i) => i + 1).map(n => (
                                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between gap-4 mt-2">
                    <span className="text-2xl font-extrabold text-foreground shrink-0">
                        {formatPrice(state.totalPrice)}
                    </span>
                    <Button
                        variant="default"
                        size="lg"
                        className="flex-1 font-bold uppercase tracking-wider text-base"
                        disabled={state.isButtonDisabled}
                        onClick={actions.handleAddToCart}
                    >
                        {state.isAdding ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {t("adding")}
                            </>
                        ) : state.isPolicyLimitReached ? (
                            t("limitReached", { max: MAX_QTY_PER_ITEM })
                        ) : state.isStockDepleted ? (
                            t("allAvailableAdded")
                        ) : (
                            <>
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                {state.isGlobalOutOfStock ? t("soldOutBtn") : t("addToCart")}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}