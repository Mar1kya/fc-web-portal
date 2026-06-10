import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import { getLocale, getTranslations } from "next-intl/server";
import PlayerHero from "./_components/player-hero";
import ProfileTabs from "../_components/profile-tabs";
import sanitizeHtml from 'sanitize-html';
import NewsGrid from "@/components/shared/news-grid";
import MediaGallery from "@/components/shared/media-gallery";
import PlayerQuickStats from "./_components/player-quick-stats";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const tEnums = await getTranslations("Enums");
    const tMeta = await getTranslations("PlayerProfile.Metadata");
    const player = await prisma.player.findUnique({
        where: { slug, deletedAt: null },
        include: { translations: true },
    });

    if (!player) {
        return {}
    }

    const translation = getTranslation(player, locale);
    const playerName = translation?.name || (locale === "uk" ? "Без назви" : "Untitled");

    let positionName = "";
    try {
        positionName = tEnums(`PlayerRole.${player.position}`);
    } catch {
        positionName = player.position;
    }

    const pageTitle = `${playerName} | ${positionName}`;
    const pageDescription = tMeta("description", { name: playerName, position: positionName.toLowerCase() });
    const imageUrl = player.avatar ? player.avatar : "/images/team.jpg";

    return {
        title: pageTitle,
        description: pageDescription,
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 800,
                    alt: playerName,
                }
            ],
            type: "profile",
        },
    };
}

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
            },
            lineupEntries: {
                where: {
                    played: true,
                    match: { deletedAt: null, status: "FINISHED" }
                },
                include: {
                    match: {
                        select: { homeScore: true, awayScore: true, isHomeGame: true }
                    }
                }
            },
            events: {
                where: {
                    match: { deletedAt: null, status: "FINISHED" }
                }
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
            <PlayerQuickStats player={player} />
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
                        <MediaGallery media={player.media} />
                    ) : (
                        <p className="text-muted-foreground">{t("emptyMedia")}</p>
                    )
                }
            />
        </>
    );
}