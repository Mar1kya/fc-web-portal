import H1 from "@/components/ui/heading";
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import NewsCard from "./news-card";
import NewsFilters from "./news-filters";
import { PostType, TeamContext } from "../../../../../../generated/prisma";
import { startOfDay, endOfDay, parse } from "date-fns";
import AppPagination from "@/components/layout/app-pagination";
import { PAGINATION } from "@/lib/constants";

export default async function LatestNews({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const locale = await getLocale();
    const t = await getTranslations("NewsPage");
    const typeFilter = typeof searchParams.type === 'string' ? searchParams.type as PostType : undefined;
    const teamFilter = typeof searchParams.team === 'string' ? searchParams.team as TeamContext : undefined;
    const dateParam = typeof searchParams.date === 'string' ? searchParams.date : undefined;
    const pageParam = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    let dateFilter = undefined;
    if (dateParam) {
        const parsedDate = parse(dateParam, "yyyy-MM-dd", new Date());
        dateFilter = {
            gte: startOfDay(parsedDate),
            lte: endOfDay(parsedDate)
        };
    }
    const whereClause = {
        isPublished: true,
        ...(typeFilter && { type: typeFilter }),
        ...(teamFilter && { teamContext: teamFilter }),
        ...(dateFilter && { publishedAt: dateFilter }),
    };

    const [latestPosts, totalItems] = await Promise.all([
        prisma.post.findMany({
            where: whereClause,
            orderBy: { publishedAt: 'desc' },
            skip: (currentPage - 1) * PAGINATION.NEWS_PER_PAGE,
            take: PAGINATION.NEWS_PER_PAGE,
            include: {
                translations: { select: { language: true, title: true } },
                media: { take: 1, select: { url: true } }
            }
        }),
        prisma.post.count({ where: whereClause })
    ]);
    const totalPages = Math.ceil(totalItems / PAGINATION.NEWS_PER_PAGE);
    return (
        <section className="container mx-auto">
            <div className="flex justify-between items-end mb-8 border-b pb-4 border-border">
                <H1>{t("title")}</H1>
                <NewsFilters />
            </div>
            {latestPosts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {latestPosts.map((post) => (
                            <NewsCard key={post.id} post={post} locale={locale} />
                        ))}
                    </div>
                    <AppPagination totalPages={totalPages} currentPage={currentPage} />
                </>
            ) : (
                <p className="text-muted-foreground">{t("noNews")}</p>
            )}
        </section>
    );
}