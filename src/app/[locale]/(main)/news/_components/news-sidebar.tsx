import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import NewsCalendarFilter from "./news-calendar-filter";
export default async function NewsSidebar() {
    const publishedPosts = await prisma.post.findMany({
        where: { isPublished: true },
        select: { publishedAt: true },
    });
    const activeDates = Array.from(
        new Set(publishedPosts.map((post) => format(post.publishedAt, "yyyy-MM-dd")))
    );
    const minYear = publishedPosts.length > 0
        ? Math.min(...publishedPosts.map(post => post.publishedAt.getFullYear()))
        : new Date().getFullYear();

    return <div className="flex flex-col gap-8 w-full">
        <NewsCalendarFilter activeDates={activeDates} minYear={minYear} />
        <div>
            Турнірна таблиця
        </div>
    </div>
}