import Link from "next/link";
import Image from "next/image";
import { ImageOff, Images } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";

type GalleryCardData = {
    id: string;
    slug: string;
    coverUrl: string;
    translations: { language: string; title: string }[];
    _count: { media: number };
};

export default async function GalleryCard({ gallery, locale }: { gallery: GalleryCardData; locale: string; }) {
    const t = await getTranslations("GalleriesPage.GalleryCard");
    const translation = getTranslation(gallery, locale);
    const title = translation?.title || gallery.slug;
    const photoCount = gallery._count.media;

    return (
        <Link
            href={`/club/galleries/${gallery.slug}`}
            className="group relative flex aspect-4/5 w-full flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-emerald-600/60"
        >
            {gallery.coverUrl ? (
                <Image
                    src={gallery.coverUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
            ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/10 text-muted-foreground/30">
                    <ImageOff className="w-16 h-16" strokeWidth={1.5} />
                </div>
            )}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "linear-gradient(180deg, transparent 40%, oklch(0.14 0.04 155 / 0.85) 100%)",
                }}
            />
            <div className="relative z-10 flex flex-col gap-2 p-4">
                <h3 className="font-semibold text-base leading-snug text-white line-clamp-2">
                    {title}
                </h3>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm" style={{ background: "oklch(0.32 0.08 155 / 0.6)" }}>
                    <Images className="w-3.5 h-3.5" strokeWidth={2} />
                    {t("photoCount", { count: photoCount })}
                </span>
            </div>
        </Link>
    );
}