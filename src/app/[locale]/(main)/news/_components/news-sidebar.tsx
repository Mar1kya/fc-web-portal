import { prisma } from "@/lib/prisma";
import NewsCalendarFilter from "./news-calendar-filter";
import StandingsMini from "./standings-mini";
import { format } from "date-fns";

export default async function NewsSidebar() {
    const [activeDaysRows, minYearRows] = await Promise.all([
        prisma.$queryRaw<{ day: Date }[]>`
            SELECT DISTINCT DATE_TRUNC('day', "publishedAt") as day
            FROM "Post"
            WHERE "isPublished" = true AND "deletedAt" IS NULL
            ORDER BY day DESC
        `,
        prisma.$queryRaw<{ min_year: number | null }[]>`
            SELECT EXTRACT(YEAR FROM MIN("publishedAt"))::int as min_year
            FROM "Post"
            WHERE "isPublished" = true AND "deletedAt" IS NULL
        `,
    ]);

    const activeDates = activeDaysRows.map((row) => format(row.day, "yyyy-MM-dd"));
    const minYear = minYearRows[0]?.min_year ?? new Date().getFullYear();

    return (
        <div className="flex flex-col gap-8 w-full">
            <NewsCalendarFilter activeDates={activeDates} minYear={minYear} />
            <StandingsMini />
        </div>
    );
}