import { getTranslations } from "next-intl/server";
import H1 from "@/components/ui/heading";
import ProductSort from "../_components/product-sort";
import ActiveFilters from "../_components/active-filters";
import { Suspense } from "react";
import ShopSidebarSection from "../[slug]/_components/shop-sidebar-section";
import ShopSidebarSkeleton from "../[slug]/_components/shop-sidebar-skeleton";
import SaleProductsSection from "./_components/sale-products-section";
import SaleProductsSkeleton from "./_components/sale-products-skeleton";

export async function generateMetadata() {
    const t = await getTranslations("Shop.SalePage.Metadata");

    return {
        title: t("title"),
        description: t("description"),
        openGraph: {
            title: t("title"),
            description: t("description"),
            images: [
                {
                    url: "/images/shop.png",
                    width: 1200,
                    height: 630,
                    alt: t("title"),
                }
            ],
            type: "website",
        },
    };
}

export default async function SalePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams;
    const t = await getTranslations("Shop.SalePage");

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-4">
                <H1>{t("title")}</H1>
                <ProductSort />
            </div>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-64 shrink-0">
                    <Suspense fallback={<ShopSidebarSkeleton />}>
                        <ShopSidebarSection isSale searchParams={resolvedSearchParams} />
                    </Suspense>
                </div>
                <div className="flex-1 w-full">
                    <ActiveFilters />
                    <Suspense
                        key={JSON.stringify(resolvedSearchParams)}
                        fallback={<SaleProductsSkeleton />}
                    >
                        <SaleProductsSection searchParams={resolvedSearchParams} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}