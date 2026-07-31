import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";
import SeasonFilters from "../_components/season-filters";
import H1 from "@/components/ui/heading";
import { Suspense } from "react";
import StandingsSection from "../_components/standings-section";
import StandingsTableSkeleton from "../_components/standings-table-skeleton";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ season?: string }> }) {
    const { slug } = await params;
    const { season } = await searchParams;
    const locale = await getLocale();
    const tMeta = await getTranslations("StandingsPage.Metadata");

    const tournament = await prisma.tournament.findUnique({
        where: { slug },
        include: { translations: true },
    });

    if (!tournament) {
        return {
            title: {},
        };
    }

    const translatedTournamentName = getTranslation(tournament, locale)?.name || tournament.slug;
    const availableSeasons = await prisma.season.findMany({
        where: {
            standings: { some: { tournamentId: tournament.id } },
        },
        orderBy: { startDate: "desc" },
    });

    let currentSeason = availableSeasons.find((s) => s.slug === season);
    if (!currentSeason) {
        currentSeason = availableSeasons.find((s) => s.isActive) || availableSeasons[0];
    }

    const seasonName = currentSeason?.name || "";
    const pageTitle = seasonName
        ? `${tMeta("title", { tournament: translatedTournamentName })} | ${seasonName}`
        : tMeta("title", { tournament: translatedTournamentName });

    const pageDescription = tMeta("description", {
        tournament: translatedTournamentName,
        season: seasonName
    });

    const isCurrentActive = currentSeason?.isActive;
    const canonicalUrl = (!season || isCurrentActive)
        ? `/standings/${slug}`
        : `/standings/${slug}?season=${currentSeason?.slug}`;

    return {
        title: pageTitle,
        description: pageDescription,
        alternatives: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            images: [
                {
                    url: "/images/standings.jpg",
                    width: 1200,
                    height: 630,
                    alt: pageTitle,
                }
            ],
            type: "website",
        },
    };
}

export default async function FullStandingsPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ season?: string }> }) {
    const { slug } = await params;
    const { season } = await searchParams;
    const locale = await getLocale();
    const t = await getTranslations("StandingsPage");

    const tournament = await prisma.tournament.findUnique({
        where: { slug },
        include: { translations: true },
    });

    if (!tournament) return notFound();

    const availableSeasons = await prisma.season.findMany({
        where: {
            standings: { some: { tournamentId: tournament.id } },
        },
        orderBy: { startDate: "desc" },
    });

    if (availableSeasons.length === 0) {
        return (
            <div className="container mx-auto py-10 text-center text-muted-foreground">
                {t("noData")}
            </div>
        );
    }

    let currentSeason = availableSeasons.find((s) => s.slug === season);
    if (!currentSeason) {
        currentSeason = availableSeasons.find((s) => s.isActive) || availableSeasons[0];
    }

    const translatedTournamentName = getTranslation(tournament, locale)?.name || tournament.slug;

    return (
        <>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between sm:items-end mb-8 border-b pb-4 border-border">
                <H1>{translatedTournamentName}</H1>
                <SeasonFilters
                    seasons={availableSeasons}
                    currentSeasonSlug={currentSeason.slug}
                />
            </div>
            <Suspense 
                key={currentSeason.id} 
                fallback={<StandingsTableSkeleton />} 
            >
                <StandingsSection 
                    tournamentId={tournament.id} 
                    seasonId={currentSeason.id} 
                />
            </Suspense>
        </>
    );
}