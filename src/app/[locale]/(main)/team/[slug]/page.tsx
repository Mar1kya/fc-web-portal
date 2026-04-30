import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import { getLocale, getTranslations } from "next-intl/server";
import PlayerHero from "./_components/player-hero";
import ProfileTabs from "../_components/player-tabs";
import sanitizeHtml from 'sanitize-html';
import NewsGrid from "@/components/shared/news-grid";

export default async function PlayerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale()
    const t = await getTranslations("ProfileTabs");

    const player = await prisma.player.findUnique({
        where: { slug, deletedAt: null },
        include: {
            translations: true,
            relatedProducts: { take: 1 },
            mentionedInPosts: {
                where: { deletedAt: null },
                include: { translations: true, media: true },
                orderBy: { publishedAt: "desc" }
            },
            media: {
                where: { deletedAt: null },
            }
        },
    });

    if (!player) {
        notFound();
    }

    const translation = getTranslation(player, locale);
    let cleanBio = null;
    if (translation?.bio) {
        cleanBio = sanitizeHtml(translation.bio, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                'img': ['src', 'alt', 'width', 'height']
            }
        });
    }

    return (
        <>
            <PlayerHero player={player} />
            <ProfileTabs
                bioContent={
                    cleanBio ? (
                        <article
                            className="prose prose-emerald dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: cleanBio }}
                        />
                    ) : (
                        <p className="text-muted-foreground">{t("emptyBio")}</p>
                    )
                }
                newsContent={
                    player.mentionedInPosts.length > 0 ? (
                        <NewsGrid posts={player.mentionedInPosts} />
                    ) : (
                        <p className="text-muted-foreground">{t("emptyNews")}</p>
                    )
                }
                mediaContent={
                    player.media.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                        </div>
                    ) : (
                        <p className="text-muted-foreground">{t("emptyMedia")}</p>
                    )
                }
            />
        </>
    );
}