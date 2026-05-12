import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import MatchHero from "./_components/match-hero";
import MatchTabs from "./_components/match-tabs";
import NewsGrid from "@/components/shared/news-grid";
import MediaGallery from "@/components/shared/media-gallery";
import MatchLineups from "./_components/match-lineups";
import MatchVideos from "./_components/match-videos";
import { getTranslation } from "@/lib/utils/get-translation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const tMeta = await getTranslations("SingleMatchPage.Metadata");
    const tHero = await getTranslations("SingleMatchPage.Hero"); 

    const match = await prisma.match.findUnique({
        where: { slug, deletedAt: null },
        include: { 
            opponent: { include: { translations: true } },
            tournament: { include: { translations: true } }
        },
    });

    if (!match) {
        return {};
    }

    const opponentTranslation = getTranslation(match.opponent, locale);
    const tournamentTranslation = match.tournament ? getTranslation(match.tournament, locale) : null;
    const opponentName = opponentTranslation?.name || match.opponent.slug;
    const ourTeamName = tHero("ourTeamName");
    const tournamentName = tournamentTranslation?.name || (locale === "uk" ? "Матч" : "Match");
    const homeTeam = match.isHomeGame ? ourTeamName : opponentName;
    const awayTeam = match.isHomeGame ? opponentName : ourTeamName;
    const pageTitle = `${homeTeam} - ${awayTeam} | ${tournamentName}`;
    const pageDescription = tMeta("description", { homeTeam, awayTeam, tournament: tournamentName });
    const imageUrl = match.opponent.logoUrl ? match.opponent.logoUrl : "/images/matches.jpg";

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
                    alt: `${homeTeam} vs ${awayTeam}`,
                }
            ],
            type: "website", 
        },
    };
}

export default async function SingleMatchPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const tTabs = await getTranslations("SingleMatchPage.Tabs");
    const match = await prisma.match.findUnique({
        where: { slug },
        include: {
            tournament: { include: { translations: true } },
            opponent: { include: { translations: true } },
            events: { include: { player: { include: { translations: true } } } },
            lineup: { include: { player: { include: { translations: true } } } },
            galleries: {
                include: {
                    media: { where: { deletedAt: null } }
                }
            },
            relatedPosts: {
                where: {
                    deletedAt: null,
                    isPublished: true,
                    publishedAt: { lte: new Date() }
                },
                include: {
                    translations: true,
                    media: true
                },
                orderBy: { publishedAt: "desc" },
            }
        }
    });

    if (!match) {
        notFound();
    }

    const hasOurLineup = match.lineup && match.lineup.length > 0;
    const hasOpponentLineup = match.opponentLineup && Array.isArray(match.opponentLineup) && match.opponentLineup.length > 0;
    const hasAnyLineups = hasOurLineup || hasOpponentLineup;
    const matchMedia = match.galleries.flatMap(gallery => gallery.media);
    const hasPhotos = matchMedia.length > 0;
    const hasVideos = !!match.highlightsUrl || !!match.postMatchUrl;
    const hasNews = match.relatedPosts && match.relatedPosts.length > 0;

    return (
        <>
            <MatchHero match={match} locale={locale} />
            <MatchTabs
                lineupsContent={
                    hasAnyLineups ? (
                        <MatchLineups match={match} locale={locale} /> 
                    ) : (
                        <p className="text-muted-foreground text-center py-10">{tTabs("emptyLineups")}</p>
                    )
                }
                newsContent={
                    hasNews ? (
                        <NewsGrid posts={match.relatedPosts} />
                    ) : (
                        <p className="text-muted-foreground text-center py-10">{tTabs("emptyNews")}</p>
                    )
                }
                photosContent={
                    hasPhotos ? (
                        <MediaGallery media={matchMedia} />
                    ) : (
                        <p className="text-muted-foreground text-center py-10">{tTabs("emptyPhotos")}</p>
                    )
                }
                videosContent={
                    hasVideos ? (
                        <MatchVideos 
                            highlightsUrl={match.highlightsUrl} 
                            postMatchUrl={match.postMatchUrl} 
                        />
                    ) : (
                        <p className="text-muted-foreground text-center py-10">{tTabs("emptyVideos")}</p>
                    )
                }
            />
        </>
    );
}