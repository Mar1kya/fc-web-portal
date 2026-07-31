import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { TeamContext } from "../../../../../../generated/prisma";
import { getTranslations } from "next-intl/server";
import MatchListItem from "./match-list-item";
import { MatchDisplayData } from "./match-card";

export default async function MatchesListSection({ context, seasonId }: { context: TeamContext; seasonId?: string }) {
    const locale = await getLocale();
    const t = await getTranslations("MatchesPage");

    const seasonMatches = await prisma.match.findMany({
        where: {
            seasonId,
            teamContext: context,
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
    );
}