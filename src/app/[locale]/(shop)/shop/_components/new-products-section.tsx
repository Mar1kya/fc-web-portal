import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import ProductCard from "./product-card";

export default async function NewProductsSection() {
    const t = await getTranslations("Shop.Home");

    const newProducts = await prisma.product.findMany({
        where: {
            isArchived: false,
            deletedAt: null,
            variants: { some: { stock: { gt: 0 } } }
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: { translations: true, media: true, variants: true }
    });

    if (newProducts.length === 0) return null;

    return (
        <section>
            <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                <div className="flex items-end justify-between border-b border-border pb-4 mb-6">
                    <h2 className="text-2xl font-bold uppercase tracking-tight">{t("newTitle")}</h2>
                    <div className="flex items-center gap-2">
                        <CarouselPrevious className="static translate-y-0 translate-x-0 h-9 w-9" />
                        <CarouselNext className="static translate-y-0 translate-x-0 h-9 w-9" />
                    </div>
                </div>
                <CarouselContent className="-ml-4 sm:-ml-6">
                    {newProducts.map(product => (
                        <CarouselItem key={product.id} className="pl-4 sm:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4 flex">
                            <div className="w-full">
                                <ProductCard product={product} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}