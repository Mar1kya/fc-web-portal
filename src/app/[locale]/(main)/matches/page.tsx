import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { MatchStatus, TeamContext } from "../../../../../generated/prisma";
import H1 from "@/components/ui/heading";
import { MatchDisplayData } from "./_components/match-card";
import SeasonFilter from "./_components/season-filter";
import MatchListItem from "./_components/match-list-item";
import MatchesHighlight from "./_components/matches-highlight";

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
    const locale = await getLocale();
    const t = await getTranslations("MatchesPage");

    const currentContext = context && Object.values(TeamContext).includes(context as TeamContext)
        ? (context as TeamContext)
        : TeamContext.MAIN_TEAM;

    const allSeasons = await prisma.season.findMany({
        orderBy: { startDate: "desc" },
    });

    let currentSeason = allSeasons.find(s => s.slug === seasonSlug);
    if (!currentSeason) {
        currentSeason = allSeasons.find(s => s.isActive) || allSeasons[0];
    }

    const previousMatch = await prisma.match.findFirst({
        where: {
            status: MatchStatus.FINISHED,
            teamContext: currentContext,
            deletedAt: null
        },
        orderBy: { date: "desc" },
        include: { tournament: { include: { translations: true } }, opponent: { include: { translations: true } } }
    });

    const upcomingMatches = await prisma.match.findMany({
        where: {
            status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE, MatchStatus.POSTPONED] },
            teamContext: currentContext,
            deletedAt: null
        },
        orderBy: { date: "asc" },
        take: 2,
        include: { tournament: { include: { translations: true } }, opponent: { include: { translations: true } } }
    });

    const nextMatch = upcomingMatches[0] || null;
    const futureMatch = upcomingMatches[1] || null;

    const seasonMatches = await prisma.match.findMany({
        where: {
            seasonId: currentSeason?.id,
            teamContext: currentContext,
            deletedAt: null,
        },
        orderBy: { date: "asc" },
        include: {
            tournament: { include: { translations: true } },
            opponent: { include: { translations: true } },
        }
    }) as MatchDisplayData[];

    const groupedMatches: Record<string, MatchDisplayData[]> = {};

    seasonMatches.forEach((match) => {
        const date = new Date(match.date);
        const monthYear = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
        const capitalizedMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
        if (!groupedMatches[capitalizedMonthYear]) {
            groupedMatches[capitalizedMonthYear] = [];
        }
        groupedMatches[capitalizedMonthYear].push(match);
    });

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b pb-4 mb-2 border-border gap-4">
                <H1>{t("title")}</H1>
                {allSeasons.length > 0 && (
                    <SeasonFilter seasons={allSeasons} currentSeasonSlug={currentSeason.slug} />
                )}
            </div>
            <MatchesHighlight
                previousMatch={previousMatch}
                nextMatch={nextMatch}
                futureMatch={futureMatch}
                locale={locale}
            />
            <div className="space-y-5 mt-10">
                {Object.keys(groupedMatches).length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                        {t("noMatches")}
                    </div>
                ) : (
                    Object.entries(groupedMatches).map(([monthYear, matches]) => (
                        <div key={monthYear} className="space-y-4">
                            <div className="border-b pb-2 mb-4">
                                <h2 className="text-2xl font-black text-foreground tracking-tight">
                                    {monthYear}
                                </h2>
                            </div>
                            <div className="flex flex-col">
                                {matches.map((match) => (
                                    <MatchListItem
                                        key={match.id}
                                        match={match}
                                        locale={locale}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}