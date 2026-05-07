import { useTranslations } from "next-intl";
import MatchCard, { type MatchDisplayData } from "./match-card";

type MatchesHighlightProps = {
    previousMatch: MatchDisplayData | null;
    nextMatch: MatchDisplayData | null;
    futureMatch: MatchDisplayData | null;
    locale: string;
}

export default function MatchesHighlight({
    previousMatch,
    nextMatch,
    futureMatch,
    locale
}: MatchesHighlightProps) {
    const t = useTranslations("MatchesPage");
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            <MatchCard
                match={previousMatch}
                title={t("previousMatch")}
                locale={locale}
                emptyText={t("noPreviousMatch")}
            />
            <MatchCard
                match={nextMatch}
                title={t("nextMatch")}
                locale={locale}
                emptyText={t("noUpcomingMatches")}
            />
            <MatchCard
                match={futureMatch}
                title={t("futureMatch")}
                locale={locale}
                emptyText={t("noUpcomingMatches")}
            />
        </div>
    );
}