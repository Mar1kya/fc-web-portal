import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import PlayerJerseyForm from "./_components/player-jersey-form";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const tMeta = await getTranslations("Shop.PlayerJerseyPage.Metadata");

    const player = await prisma.player.findUnique({
        where: { slug, deletedAt: null },
        include: { translations: true }
    });

    if (!player) return {};

    const translation = getTranslation({ translations: player.translations }, locale);
    const playerName = translation?.name || player.slug;
    const pageTitle = tMeta("title", { name: playerName, number: player.number });
    const pageDescription = tMeta("description", { name: playerName });

    return {
        title: pageTitle,
        description: pageDescription,
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            images: [
                {
                    url: player.avatar || "/images/shop.png",
                    width: 800,
                    height: 800,
                    alt: playerName,
                }
            ],
            type: "website",
        },
    };
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();

    const player = await prisma.player.findUnique({
        where: { slug, deletedAt: null },
        include: {
            translations: true,
            relatedProducts: {
                where: { deletedAt: null, isArchived: false },
                include: {
                    translations: true,
                    variants: {
                        orderBy: { position: "asc" }
                    },
                    media: {
                        orderBy: { createdAt: "asc" },
                        take: 1
                    }
                }
            }
        }
    });

    if (!player || !player.relatedProducts || player.relatedProducts.length === 0) {
        notFound();
    }

    const playerTranslation = getTranslation({ translations: player.translations }, locale);
    const playerName = playerTranslation?.name || player.slug;

    const formattedProducts = player.relatedProducts.map(product => {
        const translation = product.translations.find(t => t.language === locale) || product.translations[0];

        return {
            id: product.id,
            slug: product.slug,
            translations: product.translations,
            title: translation?.name || product.slug,
            price: Number(product.price),
            salePrice: product.salePrice ? Number(product.salePrice) : null,
            isOnSale: product.isOnSale,
            sku: product.variants[0]?.sku || undefined,
            matchType: product.matchType,
            image: product.media[0]?.url || null,
            variants: product.variants.map(v => ({
                id: v.id,
                size: v.size,
                stock: v.stock
            }))
        };
    });

    return (
        <PlayerJerseyForm
            player={{
                id: player.id,
                slug: player.slug,
                name: playerName,
                number: player.number,
                avatar: player.avatar
            }}
            products={formattedProducts}
        />
    );
}