import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";
import SeasonFilters from "../_components/season-filters";
import StandingsTable from "../_components/standings-table";
import H1 from "@/components/ui/heading";

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

    return {
        title: pageTitle,
        description: pageDescription,
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

    const standings = await prisma.standing.findMany({
        where: {
            tournamentId: tournament.id,
            seasonId: currentSeason.id,
        },
        orderBy: { rank: "asc" },
    });

    const dictionaries = await prisma.teamDictionary.findMany({
        include: { translations: true },
    });

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
            <StandingsTable
                standings={standings}
                dictionaries={dictionaries}
            />
        </>
    );
}