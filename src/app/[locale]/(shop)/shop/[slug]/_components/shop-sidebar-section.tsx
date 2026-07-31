import { getCategoryFilters } from "@/lib/utils/get-category-filters";
import ShopSidebar from "../../_components/shop-sidebar";

export default async function ShopSidebarSection({
  categoryId,
  isSale,
  searchParams,
}: {
  categoryId?: string;
  isSale?: boolean;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { availableFilters, dynamicFilters } = await getCategoryFilters({ categoryId, isSale, searchParams });

  return <ShopSidebar availableFilters={availableFilters} dynamicFilters={dynamicFilters} />;
}