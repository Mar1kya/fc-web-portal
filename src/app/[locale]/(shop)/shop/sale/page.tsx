import { getTranslations } from "next-intl/server";
import H1 from "@/components/ui/heading";
import ProductCard from "../_components/product-card";
import ProductSort from "../_components/product-sort";
import ShopSidebar from "../_components/shop-sidebar";
import ActiveFilters from "../_components/active-filters";
import { getCategoryProductsData } from "@/lib/services/shop.service";
import AppPagination from "@/components/layout/app-pagination";

export default async function SalePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams;
    const t = await getTranslations("Shop.SalePage");

    const { sortedProducts, availableFilters, dynamicFilters, totalPages, currentPage } = await getCategoryProductsData({
        isSale: true,
        searchParams: resolvedSearchParams
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-4">
                <H1 className="uppercase">{t("title")}</H1>
                <ProductSort />
            </div>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-64 shrink-0">
                    <ShopSidebar availableFilters={availableFilters} dynamicFilters={dynamicFilters} />
                </div>
                <div className="flex-1 w-full">
                    <ActiveFilters />
                    {sortedProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
                                {sortedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            <AppPagination totalPages={totalPages} currentPage={currentPage} />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-2xl border-dashed border-border bg-muted/10">
                            <p className="text-muted-foreground text-lg mb-2">{t("empty")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}