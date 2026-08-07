"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { useCartStore, CartItem } from "@/store/useCartStore";
import { useStore } from "@/hooks/useStore";
import { getLiveCartData, CartSyncResult } from "@/actions/cart";

export interface LiveCartItem extends CartItem {
  unavailable: boolean;
  priceChanged: boolean;
  previousPrice: number;
}

export function useLiveCart() {
  const persistedItems = useStore(useCartStore, (s) => s.items) ?? [];
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const swrKey = useMemo(() => {
    if (persistedItems.length === 0) return null;
    return [
      "live-cart",
      persistedItems
        .map((i) => `${i.productId}:${i.variantId ?? "none"}`)
        .sort()
        .join(","),
    ] as const;
  }, [persistedItems]);

  const {
    data: liveResults,
    isLoading,
    error,
    mutate,
  } = useSWR<CartSyncResult[]>(
    swrKey,
    () =>
      getLiveCartData(
        persistedItems.map(({ productId, variantId }) => ({
          productId,
          variantId,
        })),
      ),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 60_000,
      dedupingInterval: 5_000,
    },
  );

  const items: LiveCartItem[] = persistedItems.map((cartItem) => {
    const live = liveResults?.find(
      (l) =>
        l.productId === cartItem.productId &&
        l.variantId === cartItem.variantId,
    );

    if (!liveResults) {
      return {
        ...cartItem,
        unavailable: false,
        priceChanged: false,
        previousPrice: cartItem.price,
      };
    }

    if (!live || !live.available) {
      return {
        ...cartItem,
        unavailable: true,
        priceChanged: false,
        previousPrice: cartItem.price,
      };
    }

    const clampedQuantity = live.stock! > 0 ? Math.min(cartItem.quantity, live.stock!) : cartItem.quantity;

    return {
      ...cartItem,
      price: live.price!,
      quantity: clampedQuantity,
      stock: live.stock!,
      image: live.image ?? cartItem.image,
      translations: live.translations ?? cartItem.translations,
      slug: live.slug ?? cartItem.slug,
      unavailable: live.stock! === 0,
      priceChanged: live.price !== cartItem.price,
      previousPrice: cartItem.price,
    };
  });

  const availableItems = items.filter((i) => !i.unavailable);

  const totalItems = availableItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = availableItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  const hasUnavailable = items.some((i) => i.unavailable);
  const hasPriceChanges = items.some((i) => i.priceChanged && !i.unavailable);

  return {
    items,
    availableItems,
    totalItems,
    totalPrice,
    isLoading,
    error,
    hasUnavailable,
    hasPriceChanges,
    removeItem,
    updateQuantity,
    refresh: mutate,
  };
}
