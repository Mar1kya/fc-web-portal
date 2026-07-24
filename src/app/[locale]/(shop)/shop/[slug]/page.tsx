import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import H1 from "@/components/ui/heading";
import ProductSort from "../_components/product-sort";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";
import { Suspense } from "react";
import CategoryProductsSkeleton from "./_components/category-products-skeleton";
import CategoryProductsSection from "./_components/category-products-section";
import ActiveFilters from "../_components/active-filters";
import ShopSidebarSkeleton from "./_components/shop-sidebar-skeleton";
import ShopSidebarSection from "./_components/shop-sidebar-section";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const tHomeMeta = await getTranslations("Shop.Home.Metadata");

    const category = await prisma.category.findUnique({
        where: { slug, deletedAt: null },
        include: { translations: true }
    });

    if (!category) return {};

    const translation = getTranslation(category, locale);
    const categoryName = translation?.name || category.slug;
    const pageTitle = categoryName;
    const pageDescription = tHomeMeta("description");

    return {
        title: pageTitle,
        description: pageDescription,
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            images: [
                {
                    url: "/images/shop.png",
                    width: 1200,
                    height: 630,
                    alt: pageTitle,
                }
            ],
            type: "website",
        },
    };
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const locale = await getLocale();

    const category = await prisma.category.findUnique({
        where: { slug, deletedAt: null },
        include: { translations: true },
    });

    if (!category) notFound();
    const categoryName = getTranslation(category, locale)?.name || category.slug;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-4">
                <H1>{categoryName}</H1>
                <ProductSort />
            </div>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-64 shrink-0">
                    <Suspense fallback={<ShopSidebarSkeleton />}>
                        <ShopSidebarSection categoryId={category.id} searchParams={resolvedSearchParams} />
                    </Suspense>
                </div>
                <div className="flex-1 w-full">
                    <ActiveFilters />
                    <Suspense
                        key={JSON.stringify(resolvedSearchParams)}
                        fallback={<CategoryProductsSkeleton />}
                    >
                        <CategoryProductsSection categoryId={category.id} searchParams={resolvedSearchParams} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}