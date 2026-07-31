import { prisma } from "@/lib/prisma";
import { Prisma, Demographic } from "../../../generated/prisma";

type GetCategoryFiltersParams = {
  categoryId?: string;
  isSale?: boolean;
  searchParams: { [key: string]: string | string[] | undefined };
};

type FilterableProduct = {
  price: Prisma.Decimal | number | string;
  salePrice: Prisma.Decimal | number | string | null;
  isOnSale: boolean;
  demographic: Demographic;
  color: string | null;
  apparelType: string | null;
  variants: { size: string; stock: number }[];
};

const STANDARD_SIZES = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "ONE SIZE",
];

const sortSizes = (sizes: string[]) => {
  return sizes.sort((a, b) => {
    const indexA = STANDARD_SIZES.indexOf(a.toUpperCase());
    const indexB = STANDARD_SIZES.indexOf(b.toUpperCase());
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
};

export async function getCategoryFilters({
  categoryId,
  isSale,
  searchParams,
}: GetCategoryFiltersParams) {
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : null;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : null;

  const activeDemographics =
    typeof searchParams.demographic === "string"
      ? (searchParams.demographic.split(",") as Demographic[])
      : [];
  const activeColors =
    typeof searchParams.color === "string" ? searchParams.color.split(",") : [];
  const activeApparelTypes =
    typeof searchParams.apparelType === "string"
      ? searchParams.apparelType.split(",")
      : [];
  const activeSizes =
    typeof searchParams.size === "string" ? searchParams.size.split(",") : [];

  const baseWhere: Prisma.ProductWhereInput = {
    deletedAt: null,
    isArchived: false,
  };
  if (categoryId) baseWhere.categoryId = categoryId;
  if (isSale) baseWhere.isOnSale = true;

  const allProductsForAggregations = await prisma.product.findMany({
    where: baseWhere,
    select: {
      price: true,
      salePrice: true,
      isOnSale: true,
      demographic: true,
      color: true,
      apparelType: true,
      variants: { select: { size: true, stock: true } },
    },
  });

  const inStockProducts = allProductsForAggregations.filter(
    (p) => p.variants.reduce((sum, v) => sum + v.stock, 0) > 0,
  );

  const allPrices = inStockProducts.map((p) =>
    p.isOnSale && p.salePrice ? Number(p.salePrice) : Number(p.price),
  );
  const absoluteMinPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const absoluteMaxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 1000;

  const rawAvailableSizes = Array.from(
    new Set(
      inStockProducts.flatMap((p) =>
        p.variants.filter((v) => v.stock > 0).map((v) => v.size),
      ),
    ),
  );

  const availableFilters = {
    demographics: Array.from(
      new Set(inStockProducts.map((p) => p.demographic).filter(Boolean)),
    ) as string[],
    colors: Array.from(
      new Set(inStockProducts.map((p) => p.color).filter(Boolean)),
    ) as string[],
    apparelTypes: Array.from(
      new Set(inStockProducts.map((p) => p.apparelType).filter(Boolean)),
    ) as string[],
    sizes: sortSizes(rawAvailableSizes),
    absoluteMinPrice,
    absoluteMaxPrice,
  };

  const passesFilters = (
    product: FilterableProduct,
    skipCategory: "demographic" | "color" | "apparelType" | "size" | null,
  ) => {
    const actualPrice =
      product.isOnSale && product.salePrice
        ? Number(product.salePrice)
        : Number(product.price);

    if (minPrice && actualPrice < minPrice) return false;
    if (maxPrice && actualPrice > maxPrice) return false;

    if (
      skipCategory !== "demographic" &&
      activeDemographics.length > 0 &&
      !activeDemographics.includes(product.demographic)
    )
      return false;

    if (
      skipCategory !== "color" &&
      activeColors.length > 0 &&
      (!product.color || !activeColors.includes(product.color))
    )
      return false;

    if (
      skipCategory !== "apparelType" &&
      activeApparelTypes.length > 0 &&
      (!product.apparelType ||
        !activeApparelTypes.includes(product.apparelType))
    )
      return false;

    if (
      skipCategory !== "size" &&
      activeSizes.length > 0 &&
      !product.variants.some((v) => v.stock > 0 && activeSizes.includes(v.size))
    )
      return false;

    return true;
  };

  const rawDynamicSizes = Array.from(
    new Set(
      inStockProducts
        .filter((p) => passesFilters(p, "size"))
        .flatMap((p) =>
          p.variants.filter((v) => v.stock > 0).map((v) => v.size),
        ),
    ),
  );

  const dynamicFilters = {
    demographics: Array.from(
      new Set(
        inStockProducts
          .filter((p) => passesFilters(p, "demographic"))
          .map((p) => p.demographic)
          .filter(Boolean),
      ),
    ) as string[],
    colors: Array.from(
      new Set(
        inStockProducts
          .filter((p) => passesFilters(p, "color"))
          .map((p) => p.color)
          .filter(Boolean),
      ),
    ) as string[],
    apparelTypes: Array.from(
      new Set(
        inStockProducts
          .filter((p) => passesFilters(p, "apparelType"))
          .map((p) => p.apparelType)
          .filter(Boolean),
      ),
    ) as string[],
    sizes: sortSizes(rawDynamicSizes),
  };

  return { availableFilters, dynamicFilters };
}
