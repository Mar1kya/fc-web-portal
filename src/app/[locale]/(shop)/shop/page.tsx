import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import H1 from "@/components/ui/heading";
import HotProductsSection from "./_components/hot-products-section";
import NewProductsSection from "./_components/new-products-section";
import ProductCarouselSkeleton from "./_components/product-carousel-skeleton";

export async function generateMetadata() {
    const t = await getTranslations("Shop.Home.Metadata");

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

export default async function ShopHomePage() {
    const t = await getTranslations("Shop.Home");

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
                    <H1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase leading-tight">
                        {t("hero.title1")} <br className="hidden md:block" /> {t("hero.title2")}
                    </H1>
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
            <Suspense fallback={<ProductCarouselSkeleton title={t("hotTitle")} />}>
                <HotProductsSection />
            </Suspense>
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
            <Suspense fallback={<ProductCarouselSkeleton title={t("newTitle")} />}>
                <NewProductsSection />
            </Suspense>
        </div>
    );
}