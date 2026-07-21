import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import HomeStandings from "./_components/home-standings";
import HeroSection from "./_components/hero-section";
import MatchesHighlight from "./matches/_components/matches-highlight";
import NewsCard from "./news/_components/news-card";
import ProductCard from "../(shop)/shop/_components/product-card";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HomePage.Metadata");

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      url: "/",
      images: [
        {
          url: "/main.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
  };
}
const getThresholdDate = () => new Date(Date.now() - 4 * 60 * 60 * 1000);
const getCurrentDate = () => new Date();

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getTranslations("HomePage");

  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
  });

  const seasonFilter = activeSeason ? { seasonId: activeSeason.id } : {};
  const heroMatchDateThreshold = getThresholdDate();

  const [
    heroMatchInitial,
    previousMatch,
    nextMatch,
    futureMatch,
    latestPosts,
    featuredProducts,
    tournamentsWithStandings,
    teamDictionaries,
  ] = await Promise.all([
    prisma.match.findFirst({
      where: {
        deletedAt: null,
        teamContext: "MAIN_TEAM",
        ...seasonFilter,
        OR: [
          { status: "LIVE" },
          {
            status: "SCHEDULED",
            date: { gte: heroMatchDateThreshold }
          }
        ],
      },
      orderBy: [{ date: "asc" }],
      include: {
        opponent: { include: { translations: true } },
        tournament: { include: { translations: true } },
      },
    }),
    prisma.match.findFirst({
      where: {
        deletedAt: null,
        teamContext: "MAIN_TEAM",
        status: "FINISHED",
        ...seasonFilter
      },
      orderBy: { date: "desc" },
      include: {
        opponent: { include: { translations: true } },
        tournament: { include: { translations: true } },
      },
    }),
    prisma.match.findFirst({
      where: {
        deletedAt: null,
        teamContext: "MAIN_TEAM",
        status: "SCHEDULED",
        date: { gte: getCurrentDate() },
        ...seasonFilter
      },
      orderBy: { date: "asc" },
      include: {
        opponent: { include: { translations: true } },
        tournament: { include: { translations: true } },
      },
    }),
    prisma.match.findFirst({
      where: {
        deletedAt: null,
        teamContext: "MAIN_TEAM",
        status: "SCHEDULED",
        date: { gte: getCurrentDate() },
        ...seasonFilter
      },
      orderBy: { date: "asc" },
      skip: 1,
      include: {
        opponent: { include: { translations: true } },
        tournament: { include: { translations: true } },
      },
    }),
    prisma.post.findMany({
      where: { deletedAt: null, isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: {
        translations: { where: { language: locale } },
        media: { take: 1 },
      },
    }),
    prisma.product.findMany({
      where: { deletedAt: null, isArchived: false, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        translations: { where: { language: locale } },
        media: { take: 1 },
        variants: { select: { stock: true } },
      },
    }),
    prisma.tournament.findMany({
      where: {
        deletedAt: null,
        hasStandings: true,
        standings: {
          some: activeSeason ? { seasonId: activeSeason.id } : {},
        },
      },
      include: {
        translations: { where: { language: locale } },
        standings: {
          where: activeSeason ? { seasonId: activeSeason.id } : {},
          orderBy: { rank: "asc" },
        },
      },
    }),
    prisma.teamDictionary.findMany({
      include: { translations: true },
    }),
  ]);

  const heroMatch = heroMatchInitial || previousMatch;

  const matchToDisplay = (m: typeof previousMatch) =>
    m
      ? {
        id: m.id,
        slug: m.slug,
        date: m.date,
        status: m.status,
        isHomeGame: m.isHomeGame,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        stadium: m.stadium,
        tournament: m.tournament,
        opponent: m.opponent,
        round: m.round,
      }
      : null;

  const hasStandings = tournamentsWithStandings.some((t) => t.standings.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <HeroSection match={heroMatch} locale={locale} />
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-8">
          <div className="flex items-end justify-between border-b border-border/50 pb-4">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {t("Sections.matches")}
            </h2>
            <Link
              href="/matches"
              className="flex items-center gap-0.5 text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors pb-1"
            >
              {t("Sections.allMatches")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <MatchesHighlight
            previousMatch={matchToDisplay(previousMatch)}
            nextMatch={matchToDisplay(nextMatch)}
            futureMatch={matchToDisplay(futureMatch)}
            locale={locale}
          />
        </section>
        {latestPosts.length > 0 && (
          <section className="flex flex-col gap-8">
            <div className="flex items-end justify-between border-b border-border/50 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {t("Sections.news")}
              </h2>
              <Link
                href="/news"
                className="flex items-center gap-0.5 text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors pb-1"
              >
                {t("Sections.allNews")}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <NewsCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </section>
        )}
        {hasStandings && (
          <section className="flex flex-col gap-8">
            <div className="border-b border-border/50 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {t("Sections.standings")}
              </h2>
            </div>
            <div className="flex flex-col gap-8 w-full">
              {tournamentsWithStandings
                .filter((tournament) => tournament.standings.length > 0)
                .map((tournament) => (
                  <HomeStandings
                    key={tournament.id}
                    tournament={tournament}
                    dictionaries={teamDictionaries}
                  />
                ))}
            </div>
          </section>
        )}
        {featuredProducts.length > 0 && (
          <section className="flex flex-col gap-8">
            <div className="flex items-end justify-between border-b border-border/50 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {t("Sections.shop")}
              </h2>
              <Link
                href="/shop"
                className="flex items-center gap-0.5 text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors pb-1"
              >
                {t("Sections.allProducts")}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}