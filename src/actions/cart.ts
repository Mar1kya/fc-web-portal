"use server";

import { prisma } from "@/lib/prisma";

export type CartSyncLine = {
  productId: string;
  variantId: string | null;
}

export type CartSyncResult = {
  productId: string;
  variantId: string | null;
  available: boolean;
  reason?: "NOT_FOUND" | "ARCHIVED" | "VARIANT_NOT_FOUND";
  price?: number;
  originalPrice?: number;
  isOnSale?: boolean;
  stock?: number;
  slug?: string;
  image?: string | null;
  translations?: { language: string; name: string }[];
  size?: string | null;
}

export async function getLiveCartData(
  lines: CartSyncLine[],
): Promise<CartSyncResult[]> {
  if (!Array.isArray(lines) || lines.length === 0) return [];

  const productIds = [...new Set(lines.map((l) => l.productId))];

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      deletedAt: null,
    },
    include: {
      translations: true,
      variants: true,
      media: { take: 1 },
    },
  });

  return lines.map((line) => {
    const product = products.find((p) => p.id === line.productId);

    if (!product || product.isArchived) {
      return {
        productId: line.productId,
        variantId: line.variantId,
        available: false,
        reason: !product ? "NOT_FOUND" : "ARCHIVED",
      };
    }

    const variant = line.variantId
      ? product.variants.find((v) => v.id === line.variantId)
      : null;

    if (line.variantId && !variant) {
      return {
        productId: line.productId,
        variantId: line.variantId,
        available: false,
        reason: "VARIANT_NOT_FOUND",
      };
    }

    const effectivePrice =
      product.isOnSale && product.salePrice != null
        ? Number(product.salePrice)
        : Number(product.price);

    return {
      productId: product.id,
      variantId: line.variantId,
      available: true,
      price: effectivePrice,
      originalPrice: Number(product.price),
      isOnSale: product.isOnSale,
      stock: variant?.stock ?? 0,
      slug: product.slug,
      image: product.media[0]?.url ?? null,
      translations: product.translations.map((t) => ({
        language: t.language,
        name: t.name,
      })),
      size: variant?.size ?? null,
    };
  });
}