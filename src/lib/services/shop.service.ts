import { prisma } from "@/lib/prisma";
import { Prisma, Demographic } from "../../../generated/prisma";
import { PAGINATION } from "../constants";

type GetCategoryProductsParams = {
  categoryId?: string;
  isSale?: boolean;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function getCategoryProducts({
  categoryId,
  isSale,
  searchParams,
}: GetCategoryProductsParams) {
  const sortParam =
    typeof searchParams.sort === "string" ? searchParams.sort : "newest";
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

  const filtersWhere: Prisma.ProductWhereInput = {
    AND: [
      activeDemographics.length > 0
        ? { demographic: { in: activeDemographics } }
        : {},
      activeColors.length > 0 ? { color: { in: activeColors } } : {},
      activeApparelTypes.length > 0
        ? { apparelType: { in: activeApparelTypes } }
        : {},
      activeSizes.length > 0
        ? {
            variants: { some: { size: { in: activeSizes }, stock: { gt: 0 } } },
          }
        : {},
      minPrice || maxPrice
        ? {
            OR: [
              {
                isOnSale: true,
                salePrice: { gte: minPrice || 0, lte: maxPrice || 999999 },
              },
              {
                isOnSale: false,
                price: { gte: minPrice || 0, lte: maxPrice || 999999 },
              },
            ],
          }
        : {},
    ],
  };

  const filteredProductsRaw = await prisma.product.findMany({
    where: { ...baseWhere, ...filtersWhere },
    include: { translations: true, media: true, variants: true },
  });

  const sortedProducts = filteredProductsRaw.sort((a, b) => {
    const aTotalStock = a.variants.reduce((sum, v) => sum + v.stock, 0);
    const bTotalStock = b.variants.reduce((sum, v) => sum + v.stock, 0);
    if (aTotalStock > 0 && bTotalStock <= 0) return -1;
    if (aTotalStock <= 0 && bTotalStock > 0) return 1;

    const priceA =
      a.isOnSale && a.salePrice ? Number(a.salePrice) : Number(a.price);
    const priceB =
      b.isOnSale && b.salePrice ? Number(b.salePrice) : Number(b.price);
    if (sortParam === "price_asc") return priceA - priceB;
    if (sortParam === "price_desc") return priceB - priceA;
    if (sortParam === "sale_first") {
      if (a.isOnSale && !b.isOnSale) return -1;
      if (!a.isOnSale && b.isOnSale) return 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pageParam =
    typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const totalPages = Math.ceil(
    sortedProducts.length / PAGINATION.SHOP_PER_PAGE,
  );
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PAGINATION.SHOP_PER_PAGE,
    currentPage * PAGINATION.SHOP_PER_PAGE,
  );

  return {
    sortedProducts: paginatedProducts,
    totalPages,
    currentPage,
  };
}
