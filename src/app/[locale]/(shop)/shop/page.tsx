import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "./_components/product-card";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ComponentProps } from "react"; 

type ExpectedProductType = ComponentProps<typeof ProductCard>["product"];

export default async function ShopHomePage() {
    const t = await getTranslations("Shop.Home");

    const hotProductsRaw = await prisma.product.findMany({
        where: { isFeatured: true, isArchived: false, deletedAt: null },
        include: { translations: true, media: true, variants: true }
    });
    const hotProducts = hotProductsRaw
        .filter(p => p.variants.reduce((sum, v) => sum + v.stock, 0) > 0)
        .slice(0, 12);

    const newProductsRaw = await prisma.product.findMany({
        where: { isArchived: false, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: { translations: true, media: true, variants: true }
    });
    const newProducts = newProductsRaw
        .filter(p => p.variants.reduce((sum, v) => sum + v.stock, 0) > 0)
        .slice(0, 12);

    return (
        <div className="flex flex-col gap-12">
            <section className="relative w-full h-100 md:h-125 lg:h-150 rounded-3xl overflow-hidden group border border-border">
                <Image
                    src="/images/shop.png"
                    alt="New Collection"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 md:p-12 lg:p-16 flex flex-col gap-4 max-w-2xl text-white">
                    <span className="font-bold uppercase tracking-widest text-sm md:text-base">
                        {t("hero.subtitle")}
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase leading-tight">
                        {t("hero.title1")} <br className="hidden md:block" /> {t("hero.title2")}
                    </h1>
                    <p className="text-zinc-300 text-sm md:text-base max-w-md">
                        {t("hero.description")}
                    </p>
                    <div className="mt-4">
                        <Button size="lg" asChild variant="secondary">
                            <Link href="/shop/kits">
                                {t("hero.button")}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
            {hotProducts.length > 0 && (
                <section>
                    <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                        <div className="flex items-end justify-between border-b border-border pb-4 mb-6">
                            <h2 className="text-2xl font-bold uppercase tracking-tight">{t("hotTitle")}</h2>
                            <div className="flex items-center gap-2">
                                <CarouselPrevious className="static translate-y-0 translate-x-0 h-9 w-9" />
                                <CarouselNext className="static translate-y-0 translate-x-0 h-9 w-9" />
                            </div>
                        </div>
                        <CarouselContent className="-ml-4 sm:-ml-6">
                            {hotProducts.map(product => (
                                <CarouselItem key={product.id} className="pl-4 sm:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4 flex">
                                    <div className="w-full">
                                        <ProductCard product={product as unknown as ExpectedProductType} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </section>
            )}
            <section className="relative w-full h-62.5 md:h-75 rounded-3xl overflow-hidden bg-card border border-border flex items-center shadow-sm">
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
                    <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-red-900/60 to-transparent"></div>
                </div>
                <div className="relative z-10 p-8 md:p-12 flex flex-col gap-4">
                    <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight">
                        {t("saleBanner.title1")} <span className="text-red-500">{t("saleBanner.title2")}</span> <br /> {t("saleBanner.title3")}
                    </h2>
                    <p className="text-muted-foreground max-w-sm">
                        {t("saleBanner.description")}
                    </p>
                    <div className="mt-2">
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/shop/sale">{t("saleBanner.button")}</Link>
                        </Button>
                    </div>
                </div>
            </section>
            {newProducts.length > 0 && (
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
                                        <ProductCard product={product as unknown as ExpectedProductType} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </section>
            )}
        </div>
    );
}