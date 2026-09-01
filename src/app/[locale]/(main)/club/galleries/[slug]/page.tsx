import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Images } from "lucide-react";
import { getTranslation } from "@/lib/utils/get-translation";
import H1 from "@/components/ui/heading";
import MediaGallery from "@/components/shared/media-gallery";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const locale = await getLocale();
    const gallery = await prisma.gallery.findUnique({
        where: { slug, deletedAt: null },
        include: {
            translations: { select: { language: true, title: true } },
            media: { select: { id: true, url: true } },
        },
    });

    if (!gallery) {
        return {};
    }

    const translation = getTranslation(gallery, locale);
    const title = translation?.title || gallery.slug;

    return {
        title: title,
        description: title,
        openGraph: {
            title,
            type: "website",
            url: `/club/galleries/${gallery.slug}`,
            images: gallery.coverUrl
                ? [{ url: gallery.coverUrl, width: 1200, height: 630, alt: title }]
                : undefined,
        },
    };
}

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const t = await getTranslations("GalleriesPage.GalleryCard");

    const gallery = await prisma.gallery.findUnique({
        where: { slug, deletedAt: null },
        include: {
            translations: { select: { language: true, title: true } },
            media: { select: { id: true, url: true } },
        },
    });

    if (!gallery) {
        notFound();
    }

    const translation = getTranslation(gallery, locale);
    const title = translation?.title || gallery.slug;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b pb-4 mb-2 border-border gap-4">
                <div className="flex flex-col gap-1.5">
                    <H1>{title}</H1>
                    <span className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground">
                        <Images className="w-4 h-4" strokeWidth={2} />
                        {t("photoCount", { count: gallery.media.length })}
                    </span>
                </div>
            </div>
            <MediaGallery media={gallery.media} />
        </div>
    );
}