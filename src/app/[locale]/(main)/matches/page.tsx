import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { MatchStatus, TeamContext } from "../../../../../generated/prisma";
import H1 from "@/components/ui/heading";
import MatchesHighlight from "./_components/matches-highlight";

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ context?: string }> }) {
    const { context } = await searchParams;
    const locale = await getLocale();
    const t = await getTranslations("MatchesPage");

    const currentContext = context && Object.values(TeamContext).includes(context as TeamContext)
        ? (context as TeamContext)
        : TeamContext.MAIN_TEAM;

    const previousMatch = await prisma.match.findFirst({
        where: {
            status: MatchStatus.FINISHED,
            teamContext: currentContext
        },
        orderBy: { date: "desc" },
        include: {
            tournament: { include: { translations: true } },
            opponent: { include: { translations: true } },
        }
    });
    const upcomingMatches = await prisma.match.findMany({
        where: {
            status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE, MatchStatus.POSTPONED] },
            teamContext: currentContext
        },
        orderBy: { date: "asc" },
        take: 2,
        include: {
            tournament: { include: { translations: true } },
            opponent: { include: { translations: true } },
        }
    });

    const nextMatch = upcomingMatches[0] || null;
    const futureMatch = upcomingMatches[1] || null;

    return (
        <>
            <H1>{t("title")}</H1>
            <MatchesHighlight
                previousMatch={previousMatch}
                nextMatch={nextMatch}
                futureMatch={futureMatch}
                locale={locale}
            />
        </>
    );
}