"use client";

import Image from "next/image";
import Link from "next/link";
import { User2, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {  useState } from "react";

type PlayerJerseyGalleryProps = {
    player: { slug: string; name: string; number: number; avatar: string | null };
    activeProductImage: string | null;
    activeProductTitle: string;
    activeProductSlug: string;
    isOutOfStock?: boolean;
};

export default function PlayerJerseyGallery({ player, activeProductImage, activeProductTitle, activeProductSlug, isOutOfStock }: PlayerJerseyGalleryProps) {
    const t = useTranslations("Shop.ProductPage");
    const [isProductImageLoading, setIsProductImageLoading] = useState(true);
    const [prevImage, setPrevImage] = useState(activeProductImage);

    if (activeProductImage !== prevImage) {
        setPrevImage(activeProductImage);
        setIsProductImageLoading(true);
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <Link
                href={`/team/${player.slug}`}
                className="relative block w-full aspect-4/5 bg-muted/10 rounded-2xl overflow-hidden border border-border/50 group cursor-pointer"
            >
                {player.avatar ? (
                    <Image
                        src={player.avatar}
                        alt={player.name}
                        fill
                        className={cn(
                            "object-cover object-top transition-transform duration-700 group-hover:scale-105",
                            isOutOfStock && "grayscale brightness-75 opacity-90"
                        )}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                        unoptimized
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/30">
                        <User2 className="w-20 h-20" strokeWidth={1.5} />
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute -right-4 -bottom-6 text-[140px] font-black leading-none text-white/10 group-hover:text-emerald-500/20 transition-colors duration-500 pointer-events-none z-0">
                    {player.number}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between z-10">
                    <div className="flex flex-col">
                        <span className="text-emerald-400 font-bold tracking-widest text-sm">#{player.number}</span>
                        <h2 className="text-3xl font-black uppercase leading-tight mt-1 text-white">
                            {player.name}
                        </h2>
                    </div>
                </div>
            </Link>
            <Link
                href={`/shop/product/${activeProductSlug}`}
                className="relative block w-full aspect-4/5 bg-muted/10 rounded-2xl overflow-hidden border border-border/50 group cursor-pointer"
            >
                {activeProductImage ? (
                    <>
                        {isProductImageLoading && (
                            <div className="absolute inset-0 bg-muted animate-pulse z-10" />
                        )}
                        <Image
                            src={activeProductImage}
                            alt={activeProductTitle}
                            fill
                            className={cn(
                                "object-cover object-top transition-opacity duration-300",
                                isOutOfStock && "grayscale brightness-[0.6] opacity-90",
                                isProductImageLoading ? "opacity-0" : "opacity-100 group-hover:scale-105"
                            )}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            onLoad={() => setIsProductImageLoading(false)}
                        />
                    </>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/30">
                        <ImageOff className="w-16 h-16" strokeWidth={1.5} />
                        <span className="text-sm font-medium uppercase tracking-widest">{t("noPhoto")}</span>
                    </div>
                )}
            </Link>
        </div>
    );
}