"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Variant = { id: string; size: string; stock: number };

type ProductFormProps = {
    product: {
        id: string;
        price: number;
        salePrice: number | null;
        isOnSale: boolean;
        sku?: string;
    };
    variants: Variant[];
};

export default function ProductForm({ product, variants }: ProductFormProps) {
    const t = useTranslations("Shop.ProductPage");
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<string>("1");
    const [error, setError] = useState<string | null>(null);

    const isOutOfStock = variants.reduce((sum, v) => sum + v.stock, 0) <= 0;
    const selectedVariant = variants.find(v => v.size === selectedSize);
    const maxAvailable = selectedVariant ? Math.min(selectedVariant.stock, 10) : 1;

    const discountPercentage = product.isOnSale && product.salePrice && product.price > 0
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    const currentPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    const totalPrice = currentPrice * Number(quantity);

    const handleSizeSelect = (size: string, stock: number) => {
        if (stock <= 0) return;
        setSelectedSize(size);
        setQuantity("1"); 
        setError(null);
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            setError(t("selectSizeError"));
            return;
        }
        console.log("Додано:", { id: product.id, size: selectedSize, qty: quantity, total: totalPrice });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <Badge variant={isOutOfStock ? "secondary" : "outline"} className={cn(isOutOfStock ? "" : "text-emerald-600 border-emerald-600/30 bg-emerald-600/10")}>
                        {isOutOfStock ? t("outOfStock") : t("inStock")}
                    </Badge>
                    {product.sku && <span className="text-sm text-muted-foreground">{t("sku")}: {product.sku}</span>}
                </div>
                <div className="flex items-baseline gap-3">
                    {product.isOnSale && product.salePrice ? (
                        <>
                            <span className="text-3xl font-extrabold text-red-500">{formatPrice(product.salePrice)}</span>
                            <span className="text-lg font-medium text-muted-foreground line-through">{formatPrice(product.price)}</span>
                            <Badge className="bg-red-500 hover:bg-red-600">-{discountPercentage}%</Badge>
                        </>
                    ) : (
                        <span className="text-3xl font-extrabold text-foreground">{formatPrice(product.price)}</span>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold uppercase tracking-wider">{t("size")}</span>
                    {error && <span className="text-sm text-red-500">{error}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                        <button
                            key={v.id}
                            type="button"
                            onClick={() => handleSizeSelect(v.size, v.stock)}
                            disabled={v.stock <= 0}
                            className={cn(
                                "h-10 px-4 rounded-md border text-sm font-medium transition-all relative overflow-hidden",
                                v.stock <= 0 ? "opacity-50 cursor-not-allowed bg-muted border-border" :
                                    selectedSize === v.size ? "border-emerald-600 bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-600" : "border-border hover:border-emerald-600"
                            )}
                        >
                            {v.size}
                            {v.stock <= 0 && <div className="absolute top-1/2 left-0 w-full h-px bg-muted-foreground/40 -rotate-12" />}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-between py-4 border-y border-border">
                <span className="text-sm font-semibold uppercase tracking-wider">{t("quantity")}</span>
                <Select value={quantity} onValueChange={setQuantity} disabled={!selectedSize || isOutOfStock}>
                    <SelectTrigger className="w-24 h-10 font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: maxAvailable }, (_, i) => i + 1).map(n => (
                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between gap-4 mt-2">
                <span className="text-2xl font-extrabold text-foreground shrink-0">
                    {formatPrice(totalPrice)}
                </span>
                <Button
                    size="default"
                    className="h-12 flex-1 font-bold uppercase tracking-wider text-base"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    {isOutOfStock ? t("soldOutBtn") : t("addToCart")}
                </Button>
            </div>
        </div>
    );
}