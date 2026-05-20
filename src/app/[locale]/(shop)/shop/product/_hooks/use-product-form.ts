import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { useStore } from "@/hooks/useStore";
import { getTranslation } from "@/lib/utils/get-translation";
import { MAX_QTY_PER_ITEM } from "@/lib/constants";

export type Variant = { id: string; size: string; stock: number };
export type ProductData = {
    id: string;
    slug: string;
    price: number;
    salePrice: number | null;
    isOnSale: boolean;
    sku?: string;
    translations: { language: string; name: string }[];
    image: string | null;
};

export const useProductForm = (product: ProductData, variants: Variant[]) => {
    const t = useTranslations("Shop.ProductPage");
    const locale = useLocale();
    const addItem = useCartStore((state) => state.addItem);
    const cartItems = useStore(useCartStore, (state) => state.items) || [];
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<string>("1");
    const [isAdding, setIsAdding] = useState(false);
    const isGlobalOutOfStock = variants.reduce((sum, v) => sum + v.stock, 0) <= 0;
    const selectedVariant = variants.find(v => v.size === selectedSize);
    const existingCartItem = cartItems.find(i => i.variantId === selectedVariant?.id);
    const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;
    const stockAvailable = selectedVariant ? selectedVariant.stock : 0;
    const isPolicyLimitReached = !!selectedVariant && (quantityInCart >= MAX_QTY_PER_ITEM);
    const isStockDepleted = !!selectedVariant && (quantityInCart >= stockAvailable) && !isPolicyLimitReached;
    const isLimitReached = isPolicyLimitReached || isStockDepleted;

    const maxAllowedToAdd = selectedVariant 
        ? Math.max(0, Math.min(stockAvailable, MAX_QTY_PER_ITEM) - quantityInCart)
        : 1;

    const isButtonDisabled = isGlobalOutOfStock || isAdding || isLimitReached;

    const discountPercentage = product.isOnSale && product.salePrice && product.price > 0
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;
    const currentPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    const totalPrice = currentPrice * (isLimitReached ? 0 : Number(quantity));

    const handleSizeSelect = (size: string, stock: number) => {
        if (stock <= 0) return;
        setSelectedSize(size);
        setQuantity("1"); 
    };

    const handleAddToCart = async () => {
        if (!selectedSize || !selectedVariant) {
            toast.error(t("selectSizeError"));
            return;
        }

        if (isLimitReached) {
            toast.error(t("limitError"));
            return;
        }

        setIsAdding(true);
        await new Promise(resolve => setTimeout(resolve, 400));

        try {
            addItem({
                productId: product.id,
                slug: product.slug,
                variantId: selectedVariant.id,
                translations: product.translations,
                price: Number(currentPrice),
                image: product.image || "",
                size: selectedVariant.size,
                stock: selectedVariant.stock,
            }, Number(quantity));

            const translatedData = getTranslation({ translations: product.translations }, locale);
            const productName = translatedData?.name || "";

            toast.success(t("addedSuccess", { name: productName }));
            setQuantity("1");
        } catch (err) {
            toast.error(t("addError"));
        } finally {
            setIsAdding(false);
        }
    };
    return {
        state: {
            selectedSize,
            quantity,
            isAdding,
            isGlobalOutOfStock,
            isLimitReached,
            isPolicyLimitReached,
            isStockDepleted,
            isButtonDisabled,
            maxAllowedToAdd,
            discountPercentage,
            currentPrice,
            totalPrice,
            cartItems
        },
        actions: {
            setQuantity,
            handleSizeSelect,
            handleAddToCart
        },
        t 
    };
};