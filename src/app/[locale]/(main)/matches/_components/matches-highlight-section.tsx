import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { TeamContext, MatchStatus } from "../../../../../../generated/prisma";
import MatchesHighlight from "./matches-highlight";

const getThresholdDate = () => new Date(Date.now() - 4 * 60 * 60 * 1000);

export default async function MatchesHighlightSection({ context, seasonId }: { context: TeamContext; seasonId?: string }) {
    const locale = await getLocale();
    const matchDateThreshold = getThresholdDate();

    const [previousMatch, upcomingMatches] = await Promise.all([
        prisma.match.findFirst({
            where: {
                status: MatchStatus.FINISHED,
                teamContext: context,
                seasonId,
                deletedAt: null
            },
            orderBy: { date: "desc" },
            include: { tournament: { include: { translations: true } }, opponent: { include: { translations: true } } }
        }),
        prisma.match.findMany({
            where: {
                teamContext: context,
                seasonId,
                deletedAt: null,
                OR: [
                    { status: MatchStatus.LIVE },
                    {
                        status: { in: [MatchStatus.SCHEDULED, MatchStatus.POSTPONED] },
                        date: { gte: matchDateThreshold }
                    }
                ]
            },
            orderBy: { date: "asc" },
            take: 2,
            include: { tournament: { include: { translations: true } }, opponent: { include: { translations: true } } }
        })
    ]);

    const nextMatch = upcomingMatches[0] || null;
    const futureMatch = upcomingMatches[1] || null;

    return (
        <MatchesHighlight
            previousMatch={previousMatch}
            nextMatch={nextMatch}
            futureMatch={futureMatch}
            locale={locale}
        />
    );
}