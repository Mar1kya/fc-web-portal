import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import NewsCard from "./news-card";
import { PostType, TeamContext } from "../../../../../../generated/prisma";
import { startOfDay, endOfDay, parse, isValid } from "date-fns";
import AppPagination from "@/components/layout/app-pagination";
import { PAGINATION } from "@/lib/constants";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function LatestNews({ searchParams }: { searchParams: SearchParams }) {
    const locale = await getLocale();
    const t = await getTranslations("NewsPage");

    const typeParam = typeof searchParams.type === 'string' ? searchParams.type : undefined;
    const teamParam = typeof searchParams.team === 'string' ? searchParams.team : undefined;
    const dateParam = typeof searchParams.date === 'string' ? searchParams.date : undefined;
    const pageParam = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    let isInvalidSearch = false;
    let typeFilter: PostType | undefined = undefined;
    if (typeParam) {
        if (Object.values(PostType).includes(typeParam as PostType)) {
            typeFilter = typeParam as PostType;
        } else {
            isInvalidSearch = true;
        }
    }
    let teamFilter: TeamContext | undefined = undefined;
    if (teamParam) {
        if (Object.values(TeamContext).includes(teamParam as TeamContext)) {
            teamFilter = teamParam as TeamContext;
        } else {
            isInvalidSearch = true;
        }
    }
    let dateFilter = undefined;
    if (dateParam) {
        const parsedDate = parse(dateParam, "yyyy-MM-dd", new Date());
        if (isValid(parsedDate)) {
            dateFilter = { gte: startOfDay(parsedDate), lte: endOfDay(parsedDate) };
        } else {
            isInvalidSearch = true;
        }
    }

    if (isInvalidSearch) {
        return <p className="text-muted-foreground">{t("noNews")}</p>;
    }

    const whereClause = {
        isPublished: true,
        deletedAt: null,
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

    if (latestPosts.length === 0) {
        return <p className="text-muted-foreground">{t("noNews")}</p>;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {latestPosts.map((post) => (
                    <NewsCard key={post.id} post={post} locale={locale} />
                ))}
            </div>
            <AppPagination totalPages={totalPages} currentPage={currentPage} />
        </>
    );
}