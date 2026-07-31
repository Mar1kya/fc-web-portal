import { getTranslations } from "next-intl/server";
import ProductCard from "../../_components/product-card";
import AppPagination from "@/components/layout/app-pagination";
import { getCategoryProducts } from "@/lib/services/shop.service";

export default async function SaleProductsSection({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const t = await getTranslations("Shop.SalePage");
    const { sortedProducts, totalPages, currentPage } = await getCategoryProducts({
        isSale: true,
        searchParams,
    });

    if (sortedProducts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-2xl border-dashed border-border bg-muted/10">
                <p className="text-muted-foreground text-lg mb-2">{t("empty")}</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
                {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            <AppPagination totalPages={totalPages} currentPage={currentPage} />
        </>
    );
}