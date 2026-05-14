import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import H1 from "@/components/ui/heading";
import ProductCard from "../_components/product-card";
import ProductSort from "../_components/product-sort";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const sortParam = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';

    const locale = await getLocale();
    const t = await getTranslations("Shop.CategoryPage");

    const category = await prisma.category.findUnique({
        where: { slug, deletedAt: null },
        include: { translations: true }
    });

    if (!category) {
        notFound();
    }

    const categoryTranslation = getTranslation(category, locale);
    const categoryName = categoryTranslation?.name || category.slug;

    const products = await prisma.product.findMany({
        where: {
            categoryId: category.id,
            deletedAt: null,
            isArchived: false
        },
        include: {
            translations: true,
            media: true,
            variants: true
        }
    });

    const sortedProducts = products.sort((a, b) => {
        const aTotalStock = a.variants.reduce((sum, v) => sum + v.stock, 0);
        const bTotalStock = b.variants.reduce((sum, v) => sum + v.stock, 0);
        const aInStock = aTotalStock > 0;
        const bInStock = bTotalStock > 0;

        if (aInStock && !bInStock) return -1;
        if (!aInStock && bInStock) return 1;

        const priceA = a.isOnSale && a.salePrice ? Number(a.salePrice) : Number(a.price);
        const priceB = b.isOnSale && b.salePrice ? Number(b.salePrice) : Number(b.price);

        if (sortParam === "price_asc") {
            return priceA - priceB;
        }

        if (sortParam === "price_desc") {
            return priceB - priceA;
        }

        if (sortParam === "sale_first") {
            if (a.isOnSale && !b.isOnSale) return -1;
            if (!a.isOnSale && b.isOnSale) return 1;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-4">
                <H1 className="uppercase">{categoryName}</H1>
                <ProductSort />
            </div>
            {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {sortedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-10">
                    {t("empty")}
                </p>
            )}
        </div>
    );
}