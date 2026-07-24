import LatestNews from "./_components/latest-news";
import { getLocale, getTranslations } from "next-intl/server";
import { PostType, TeamContext } from "../../../../../generated/prisma";
import { parse, isValid } from "date-fns";
import { Suspense } from "react";
import NewsFilters from "./_components/news-filters";
import H1 from "@/components/ui/heading";
import NewsGridSkeleton from "./_components/news-grid-skeleton";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams;
    const locale = await getLocale();
    const tNews = await getTranslations("NewsPage.Metadata");
    const tEnums = await getTranslations("Enums");
    const rawType = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : undefined;
    const rawTeam = typeof resolvedSearchParams.team === 'string' ? resolvedSearchParams.team : undefined;
    const dateParam = typeof resolvedSearchParams.date === 'string' ? resolvedSearchParams.date : undefined;
    const typeFilter = rawType && Object.values(PostType).includes(rawType as PostType) ? rawType : undefined;
    const teamFilter = rawTeam && Object.values(TeamContext).includes(rawTeam as TeamContext) ? rawTeam : undefined;

    let isValidDate = false;
    if (dateParam) {
        const parsedDate = parse(dateParam, "yyyy-MM-dd", new Date());
        isValidDate = isValid(parsedDate);
    }

    let pageTitle = tNews("title");
    let categoryName = tNews("title").toLowerCase();

    if (typeFilter && teamFilter) {
        const type = tEnums(`PostType.${typeFilter}`);
        const team = tEnums(`TeamContext.${teamFilter}`);
        pageTitle = `${type} | ${team}`;
        categoryName = locale === 'uk'
            ? `${type.toLowerCase()} команди ${team}`
            : `${type.toLowerCase()} from the ${team}`;
    } else if (typeFilter) {
        pageTitle = tEnums(`PostType.${typeFilter}`);
        categoryName = pageTitle.toLowerCase();
    } else if (teamFilter) {
        const teamName = tEnums(`TeamContext.${teamFilter}`);
        pageTitle = `${tNews("title")} | ${teamName}`;

        categoryName = locale === 'uk'
            ? `новини команди ${teamName}`
            : `news from the ${teamName}`;
    }
    if (isValidDate && dateParam) {
        pageTitle = tNews("titleWithDate", { title: pageTitle, date: dateParam });
    }
    const pageDescription = (typeFilter || teamFilter || isValidDate)
        ? tNews("dynamicDescription", { category: categoryName })
        : tNews("description");

    return {
        title: pageTitle,
        description: pageDescription,
        alternatives: {
            canonical: '/news',
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            images: [
                {
                    url: "/images/news.jpg",
                    width: 1200,
                    height: 630,
                    alt: pageTitle,
                }
            ],
            type: "website",
        },
    };
}
export default async function NewsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams;
    const t = await getTranslations("NewsPage");

    return (
        <section className="container mx-auto">
            <div className="flex justify-between items-end mb-8 border-b pb-4 border-border">
                <H1>{t("title")}</H1>
                <NewsFilters />
            </div>
            <Suspense key={JSON.stringify(resolvedSearchParams)} fallback={<NewsGridSkeleton />}>
                <LatestNews searchParams={resolvedSearchParams} />
            </Suspense>
        </section>
    );
}