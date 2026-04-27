import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Newspaper, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import NewsCard from "../_components/news-card";
import DOMPurify from 'isomorphic-dompurify';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const post = await prisma.post.findUnique({
        where: { slug, isPublished: true },
        include: { translations: true }
    });

    if (!post) return {};
    const translation = getTranslation(post, locale);

    return {
        title: translation?.title,
        description: translation?.description,
    };
}

export default async function SingleNewsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const t = await getTranslations("SingleNewsPage");
    const tEnums = await getTranslations("Enums");

    const post = await prisma.post.findUnique({
        where: { slug, isPublished: true },
        include: {
            translations: true,
            media: true
        }
    });

    if (!post) {
        notFound();
    }

    const translatedPost = getTranslation(post, locale);
    if (!translatedPost) notFound();
    const cleanContent = DOMPurify.sanitize(translatedPost.content);

    const otherNews = await prisma.post.findMany({
        where: {
            isPublished: true,
            slug: { not: slug }
        },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        include: { translations: true, media: true }
    });

    const formattedDate = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(post.publishedAt);

    return (
        <article className="w-full">
            <Link
                href="/news"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("backToNews")}
            </Link>
            <header className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                        {tEnums(`PostType.${post.type}`)}
                    </Badge>
                    <Badge variant="secondary">
                        {tEnums(`TeamContext.${post.teamContext}`)}
                    </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground leading-tight">
                    {translatedPost.title}
                </h1>
                <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <time dateTime={post.publishedAt.toISOString()}>
                        {formattedDate}
                    </time>
                </div>
            </header>
            <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-border/50">
                {post.media && post.media.length > 0 ? (
                    <Image
                        src={post.media[0].url}
                        alt={translatedPost.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                        <Newspaper className="w-20 h-20 md:w-32 md:h-32" strokeWidth={1} />
                    </div>
                )}
            </div>
            <div
                className="prose prose-stone dark:prose-invert max-w-none mb-12 text-foreground/90 leading-relaxed text-base md:text-lg"
                dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
            <Separator className="my-10 opacity-50" />
            <section className="pb-8">
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-foreground">
                    {t("otherNews")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherNews.map((otherPost) => (
                        <NewsCard
                            key={otherPost.id}
                            post={{
                                slug: otherPost.slug,
                                type: otherPost.type,
                                teamContext: otherPost.teamContext,
                                publishedAt: otherPost.publishedAt,
                                translations: otherPost.translations.map(tr => ({
                                    language: tr.language,
                                    title: tr.title,
                                })),
                                media: otherPost.media.map(m => ({
                                    url: m.url,
                                })),
                            }}
                            locale={locale}
                        />
                    ))}
                </div>
            </section>
        </article>
    );
}