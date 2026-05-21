import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";
import ProductCard from "../../_components/product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductForm from "../_components/product-form";
import ProductGallery from "../_components/product-gallery";
import { ComponentProps } from "react";
import sanitizeHtml from "sanitize-html";
import H1 from "@/components/ui/heading";

type ExpectedProductType = ComponentProps<typeof ProductCard>["product"];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const tMeta = await getTranslations("Shop.ProductPage.Metadata");
    const product = await prisma.product.findUnique({
        where: { slug, deletedAt: null, isArchived: false },
        include: { translations: true, media: { take: 1 } },
    });

    if (!product) {
        return {};
    }

    const translation = getTranslation(product, locale);
    const productName = translation?.name || (locale === "uk" ? "Без назви" : "Untitled");

    const pageTitle = tMeta("title", { name: productName });
    const pageDescription = tMeta("description", { name: productName });
    const imageUrl = product.media?.[0]?.url ? product.media[0].url : "/images/shop.png";

    return {
        title: pageTitle,
        description: pageDescription,
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 1000,
                    alt: productName,
                }
            ],
            type: "website",
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const t = await getTranslations("Shop.ProductPage");

    const product = await prisma.product.findUnique({
        where: { slug, deletedAt: null, isArchived: false },
        include: {
            translations: true,
            media: true,
            category: { include: { translations: true } },
            variants: { orderBy: { position: 'asc' } }
        }
    });

    if (!product) notFound();

    const translation = getTranslation(product, locale);
    const productName = translation?.name || product.slug;

    let cleanDescription = null;
    if (translation?.description) {
        cleanDescription = sanitizeHtml(translation.description, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                'img': ['src', 'alt', 'width', 'height']
            }
        });
    }

    const relatedProducts = await prisma.product.findMany({
        where: { categoryId: product.categoryId, id: { not: product.id }, isArchived: false, deletedAt: null },
        take: 8,
        include: { translations: true, media: true, variants: true }
    });

    const isOutOfStock = product.variants.reduce((sum, v) => sum + v.stock, 0) <= 0;
    const mainImage = product.media.length > 0 ? product.media[0].url : null;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-7">
                    <ProductGallery
                        media={product.media}
                        productName={productName}
                        isOutOfStock={isOutOfStock}
                    />
                </div>
                <div className="lg:col-span-5 flex flex-col gap-6 lg:top-24">
                    <H1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase leading-none">
                        {productName}
                    </H1>
                    <ProductForm
                        product={{
                            id: product.id,
                            slug: product.slug,
                            price: Number(product.price),
                            salePrice: product.salePrice ? Number(product.salePrice) : null,
                            isOnSale: product.isOnSale,
                            sku: product.variants[0]?.sku || undefined,
                            translations: product.translations.map(t => ({
                                language: t.language,
                                name: t.name
                            })),
                            image: mainImage
                        }}
                        variants={product.variants}
                    />
                    <div className="mt-8 pt-8 border-t border-border">
                        <h3 className="text-lg font-bold uppercase tracking-tight mb-4">{t("description")}</h3>
                        <div
                            className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: cleanDescription || t("noDescription") }}
                        />
                    </div>
                </div>
            </div>
            {relatedProducts.length > 0 && (
                <section className="mt-12 pt-12 border-t border-border">
                    <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                        <div className="flex items-end justify-between mb-8">
                            <h2 className="text-2xl font-bold uppercase tracking-tight">{t("relatedProducts")}</h2>
                            <div className="flex items-center gap-2">
                                <CarouselPrevious className="static translate-y-0 translate-x-0 h-9 w-9" />
                                <CarouselNext className="static translate-y-0 translate-x-0 h-9 w-9" />
                            </div>
                        </div>
                        <CarouselContent className="-ml-4 sm:-ml-6">
                            {relatedProducts.map(relProduct => (
                                <CarouselItem key={relProduct.id} className="pl-4 sm:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4 flex">
                                    <div className="w-full">
                                        <ProductCard product={relProduct as unknown as ExpectedProductType} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </section>
            )}
        </>
    );
}