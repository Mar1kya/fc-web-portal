import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { TeamContext } from "../../../../../generated/prisma";
import H1 from "@/components/ui/heading";
import SeasonFilter from "./_components/season-filter";
import { Suspense } from "react";
import MatchesHighlightSection from "./_components/matches-highlight-section";
import MatchesListSection from "./_components/matches-list-section";
import MatchesHighlightSkeleton from "./_components/matches-highlight-skeleton";
import MatchesListSkeleton from "./_components/matches-list-skeleton";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ context?: string; season?: string }> }) {
    const { context, season: seasonSlug } = await searchParams;
    const tMeta = await getTranslations("MatchesPage.Metadata");
    const tEnums = await getTranslations("Enums");

    const currentContext = context && Object.values(TeamContext).includes(context as TeamContext)
        ? (context as TeamContext)
        : TeamContext.MAIN_TEAM;

    const teamName = tEnums(`TeamContext.${currentContext}`);
    const allSeasons = await prisma.season.findMany({
        orderBy: { startDate: "desc" },
    });

    let currentSeason = allSeasons.find(s => s.slug === seasonSlug);
    if (!currentSeason) {
        currentSeason = allSeasons.find(s => s.isActive) || allSeasons[0];
    }

    const seasonName = currentSeason?.name || "";
    const baseTitle = tMeta("title", { team: teamName });
    const pageTitle = seasonName ? `${baseTitle} | ${seasonName}` : baseTitle;
    const pageDescription = tMeta("description", {
        team: teamName,
        season: seasonName
    });

    const isCurrentActive = currentSeason?.isActive;
    const includeSeason = seasonSlug && !isCurrentActive;

    let canonicalUrl = "/matches";
    const queryParams: string[] = [];

    if (currentContext !== "MAIN_TEAM") {
        queryParams.push(`context=${currentContext}`);
    }

    if (includeSeason) {
        queryParams.push(`season=${seasonSlug}`);
    }

    if (queryParams.length > 0) {
        canonicalUrl += `?${queryParams.join("&")}`;
    }

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
                    url: "/images/matches.jpg",
                    width: 1200,
                    height: 630,
                    alt: pageTitle,
                }
            ],
            type: "website",
        },
    };
}

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ context?: string; season?: string }> }) {
    const { context, season: seasonSlug } = await searchParams;
    const t = await getTranslations("MatchesPage");

    const currentContext = context && Object.values(TeamContext).includes(context as TeamContext)
        ? (context as TeamContext)
        : TeamContext.MAIN_TEAM;

    const allSeasons = await prisma.season.findMany({
        where: { deletedAt: null },
        orderBy: { startDate: "desc" },
    });

    let currentSeason = allSeasons.find(s => s.slug === seasonSlug);
    if (!currentSeason) {
        currentSeason = allSeasons.find(s => s.isActive) || allSeasons[0];
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b pb-4 mb-2 border-border gap-4">
                <H1>{t("title")}</H1>
                {allSeasons.length > 0 && (
                    <SeasonFilter seasons={allSeasons} currentSeasonSlug={currentSeason.slug} />
                )}
            </div>
            <Suspense
                key={`highlight-${currentContext}-${currentSeason?.id}`}
                fallback={<MatchesHighlightSkeleton />}
            >
                <MatchesHighlightSection context={currentContext} seasonId={currentSeason?.id} />
            </Suspense>
            <Suspense
                key={`list-${currentContext}-${currentSeason?.id}`}
                fallback={<MatchesListSkeleton />}
            >
                <MatchesListSection context={currentContext} seasonId={currentSeason?.id} />
            </Suspense>
        </>
    );
}