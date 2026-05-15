import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslation } from "@/lib/utils/get-translation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ImageOff } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Prisma } from "../../../../../../generated/prisma";
import { getCurrencySymbol } from "@/lib/utils";

function isProductNew(createdAt: Date) {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    return new Date(createdAt).getTime() > Date.now() - THIRTY_DAYS_MS;
}

type ProductWithRelations = {
    id: string;
    slug: string;
    price: Prisma.Decimal;
    salePrice: Prisma.Decimal | null;
    isOnSale: boolean;
    isFeatured: boolean;
    createdAt: Date;
    media: { url: string }[];
    translations: { language: string; name: string; description: string }[];
    variants: { stock: number }[];
};

export default async function ProductCard({ product }: { product: ProductWithRelations }) {
    const t = await getTranslations("Shop.ProductCard");
    const locale = await getLocale();
    const translation = getTranslation(product, locale);
    const productName = translation?.name || product.slug;
    const mainImage = product.media?.[0]?.url;
    const regularPrice = Number(product.price);
    const salePrice = product.salePrice ? Number(product.salePrice) : null;
    const totalStock = product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0;
    const isOutOfStock = totalStock <= 0;
    const currencySymbol = getCurrencySymbol();

    let discountPercentage = 0;
    if (product.isOnSale && salePrice && regularPrice > 0) {
        discountPercentage = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
    }

    const isNew = isProductNew(product.createdAt);

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:border-emerald-600/60 shadow-sm">
            <Link
                href={`/shop/product/${product.slug}`}
                className="relative aspect-4/5 w-full overflow-hidden bg-muted/10 border-b border-border/50"
            >
                <div className={`w-full h-full ${isOutOfStock ? "grayscale brightness-50" : ""}`}>
                    {mainImage ? (
                        <Image
                            src={mainImage}
                            alt={productName}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/30 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/40">
                            <ImageOff className="w-16 h-16" strokeWidth={1.5} />
                        </div>
                    )}
                </div>
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {isOutOfStock ? (
                        <Badge className="bg-zinc-800 hover:bg-zinc-800 text-white uppercase tracking-wider shadow-md pointer-events-none">
                            {t("outOfStock")}
                        </Badge>
                    ) : (
                        <>
                            {isNew && (
                                <Badge className="bg-orange-500 hover:bg-orange-600 text-white uppercase tracking-wider shadow-md pointer-events-none">
                                    {t("new")}
                                </Badge>
                            )}
                            {product.isFeatured && (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white uppercase tracking-wider shadow-md pointer-events-none">
                                    {t("hot")}
                                </Badge>
                            )}
                        </>
                    )}
                </div>
                {!isOutOfStock && product.isOnSale && discountPercentage > 0 && (
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                        <Badge className="bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider shadow-md pointer-events-none">
                            -{discountPercentage}%
                        </Badge>
                    </div>
                )}
            </Link>
            <div className="flex flex-col gap-3 p-4 grow">
                <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isOutOfStock ? "text-zinc-500" : "text-emerald-500"}`}>
                        {isOutOfStock ? t("statusOut") : t("statusIn")}
                    </span>
                    <Link href={`/shop/product/${product.slug}`}>
                        <h3 className="font-semibold text-base leading-snug line-clamp-2 transition-colors hover:text-emerald-400">
                            {productName}
                        </h3>
                    </Link>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex flex-col">
                        {product.isOnSale && salePrice ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-red-500">
                                    {salePrice.toLocaleString(locale)} {currencySymbol}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground line-through">
                                    {regularPrice.toLocaleString(locale)} {currencySymbol}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xl font-bold text-foreground">
                                {regularPrice.toLocaleString(locale)} {currencySymbol}
                            </span>
                        )}
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        className={`rounded-full transition-transform active:scale-95 border ${isOutOfStock ? "border-zinc-800 text-zinc-600" : "border-emerald-600/30 text-emerald-500 hover:bg-emerald-600 hover:text-white"}`}
                        disabled={isOutOfStock}
                        asChild={!isOutOfStock}
                    >
                        {isOutOfStock ? (
                            <div>
                                <ShoppingBag className="w-4.5 h-4.5" />
                            </div>
                        ) : (
                            <Link href={`/shop/product/${product.slug}`}>
                                <ShoppingBag className="w-4.5 h-4.5" />
                                <span className="sr-only">{t("addToCart")}</span>
                            </Link>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}