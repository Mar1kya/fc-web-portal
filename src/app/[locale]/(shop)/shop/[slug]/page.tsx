import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import H1 from "@/components/ui/heading";
import ProductCard from "../_components/product-card";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }>, }) {
    const { slug } = await params;
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
            media: true
        },
        orderBy: { createdAt: "desc" }
    });

    const sortedProducts = products.sort((a, b) => {
        const aInStock = a.stock > 0;
        const bInStock = b.stock > 0;
        if (aInStock && !bInStock) return -1;
        if (!aInStock && bInStock) return 1;
        return 0;
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-border pb-4">
                <H1 className="uppercase">{categoryName}</H1>
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
