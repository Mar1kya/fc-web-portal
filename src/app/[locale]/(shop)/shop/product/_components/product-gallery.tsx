"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";

type Media = { url: string; id: string };

type ProductGalleryProps = {
    media: Media[];
    productName: string;
    isOutOfStock?: boolean;
};

export default function ProductGallery({ media, productName, isOutOfStock }: ProductGalleryProps) {
    const t = useTranslations("Shop.ProductPage");
    const [activeIndex, setActiveIndex] = useState(0);

    const validMedia = media.filter(item => item.url && item.url.trim() !== "");

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 items-center lg:items-start">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto scrollbar-hide pb-2 lg:pb-0 lg:w-20 shrink-0">
                {validMedia.length > 0 ? (
                    validMedia.map((item, index) => (
                        <button
                            key={item.id || index}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "relative w-20 h-24 lg:w-full lg:h-28 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                                isOutOfStock && "grayscale brightness-75 opacity-80",
                                activeIndex === index ? "border-emerald-600 opacity-100" : "border-transparent opacity-60 hover:opacity-100 bg-muted/50"
                            )}
                        >
                            <Image
                                src={item.url}
                                alt={`${productName} - ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        </button>
                    ))
                ) : (
                    <div className="w-20 h-24 lg:w-full lg:h-28 rounded-lg bg-muted/50 border-2 border-border flex items-center justify-center">
                        <ImageOff className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                )}
            </div>
            <div className="flex-1 flex justify-center w-full max-w-120">
                <div className="relative w-full aspect-4/5 bg-muted/10 rounded-2xl overflow-hidden border border-border/50">
                    {validMedia.length > 0 ? (
                        validMedia.map((item, index) => (
                            <Image
                                key={item.id || index}
                                src={item.url}
                                alt={productName}
                                fill
                                className={cn(
                                    "object-cover transition-opacity duration-500 ease-in-out",
                                    activeIndex === index ? "opacity-100 z-10" : "opacity-0 z-0",
                                    isOutOfStock && "grayscale brightness-[0.6] opacity-90"
                                )}
                                priority={index === 0}
                                sizes="(max-width: 1024px) 100vw, 480px"
                            />
                        ))
                    ) : (
                        <div className={cn(
                            "flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/30",
                            isOutOfStock && "grayscale brightness-50 opacity-80"
                        )}>
                            <ImageOff className="w-20 h-20" strokeWidth={1.5} />
                            <span className="text-sm font-medium uppercase tracking-widest">{t("noPhoto")}</span>
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
}