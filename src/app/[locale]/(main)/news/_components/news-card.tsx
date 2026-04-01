"use client"

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { uk, enUS } from "date-fns/locale";
import { getTranslation } from "@/lib/utils/get-translation";
import { Newspaper } from "lucide-react";
import { useTranslations } from "next-intl";

type NewsCardProps = {
    post: {
        slug: string;
        type: string;
        teamContext: string;
        publishedAt: Date;
        translations: {
            language: string;
            title: string;
        }[];
        media: {
            url: string;
        }[];
    };
    locale: string;
};

export default function NewsCard({ post, locale }: NewsCardProps) {
    const t = useTranslations("Enums");
    const translation = getTranslation(post, locale);
    const fallbackTitle = locale === 'uk' ? "Без заголовка" : "Untitled";
    const title = translation?.title || fallbackTitle;
    const imageUrl = post.media[0]?.url;
    const postTypeStr = t(`PostType.${post.type}`);
    const teamContextStr = t(`TeamContext.${post.teamContext}`);
    const dateLocale = locale === 'uk' ? uk : enUS;
    const formattedDate = format(new Date(post.publishedAt), "dd.MM.yyyy, HH:mm", { locale: dateLocale });

    return (
        <Link href={`/news/${post.slug}`} className="group flex flex-col gap-4 cursor-pointer">
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-muted flex items-center justify-center border border-border/50">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/50 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/50">
                        <Newspaper className="w-12 h-12" strokeWidth={1.5} />
                    </div>
                )}
            </div>
            <div className="flex flex-col flex-1 space-y-2">
                <div className="flex items-center flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                    <span>{postTypeStr}</span>
                    {post.teamContext !== 'GENERAL' && (
                        <>
                            <span className="text-emerald-600/50 font-extrabold text-[14px] leading-none">|</span>
                            <span>{teamContextStr}</span>
                        </>
                    )}
                </div>
                <h3 className="text-lg font-bold leading-tight text-foreground group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {title}
                </h3>
                <span className="text-sm text-muted-foreground mt-auto pt-2">{formattedDate}</span>
            </div>
        </Link>
    );
}