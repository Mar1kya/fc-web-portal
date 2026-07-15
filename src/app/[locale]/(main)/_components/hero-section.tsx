import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CalendarDays, MapPin, ChevronRight, Calendar } from "lucide-react";
import { getTranslation } from "@/lib/utils/get-translation";
import { MatchStatus } from "../../../../../generated/prisma";
import TeamLogo from "../matches/_components/team-logo";
import { OUR_LOGO_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

type HeroMatch = {
    id: string;
    slug: string;
    date: Date;
    status: MatchStatus;
    isHomeGame: boolean;
    homeScore: number | null;
    awayScore: number | null;
    stadium: string | null;
    round: number | null;
    opponent: {
        logoUrl: string | null;
        translations: { language: string; name: string }[];
    };
    tournament: {
        slug: string;
        translations: { language: string; name: string }[];
    } | null;
} | null;

type HeroSectionProps = {
    match: HeroMatch;
    locale: string;
};

export default async function HeroSection({ match, locale }: HeroSectionProps) {
    const t = await getTranslations("HomePage.Hero");
    const tMatches = await getTranslations("MatchesPage");

    if (!match) {
        return null;
    }

    const opponentName = getTranslation(match.opponent, locale)?.name || "";
    const tournamentName = getTranslation(match.tournament, locale)?.name || "";
    const ourName = tMatches("ourTeamName");
    const homeTeamName = match.isHomeGame ? ourName : opponentName;
    const awayTeamName = match.isHomeGame ? opponentName : ourName;
    const homeLogo = match.isHomeGame ? OUR_LOGO_URL : (match.opponent.logoUrl || "");
    const awayLogo = match.isHomeGame ? (match.opponent.logoUrl || "") : OUR_LOGO_URL;
    const isFinished = match.status === MatchStatus.FINISHED;
    const isLive = match.status === MatchStatus.LIVE;
    const isFinishedOrLive = isFinished || isLive;
    const matchDate = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(match.date).replace(/\./g, '/');

    const matchTime = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(match.date);

    return (
        <div className="relative w-full py-12 md:py-20 flex flex-col items-center justify-center overflow-hidden bg-card rounded-2xl">
            <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center">
                <div className="flex flex-col items-center justify-center gap-1.5 mb-8 md:mb-12 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                        <span className="text-emerald-600 font-black uppercase tracking-wider text-xl md:text-2xl">
                            {tournamentName}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium mt-1 text-sm md:text-base">
                        <CalendarDays className="w-4 h-4 md:w-5 md:h-5" />
                        <span>{matchDate} • {matchTime}</span>
                    </div>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-2 md:gap-8">
                    <div className="flex flex-col items-center w-full min-w-0">
                        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-3 shrink-0 drop-shadow-xl">
                            <TeamLogo src={homeLogo} alt={homeTeamName} />
                        </div>
                        <h2 className="text-sm sm:text-base md:text-2xl font-bold leading-tight mb-1 text-center w-full text-balance">
                            {homeTeamName}
                        </h2>
                    </div>
                    <div className="flex flex-col items-center justify-center px-1 md:px-4 shrink-0">
                        {isFinishedOrLive ? (
                            <div className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter flex items-center gap-2 md:gap-5 bg-muted/20 px-3 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-border/50">
                                <span>{match.homeScore ?? "-"}</span>
                                <span className="text-muted-foreground/30 text-2xl md:text-5xl">:</span>
                                <span>{match.awayScore ?? "-"}</span>
                            </div>
                        ) : (
                            <div className="text-xl md:text-4xl font-black text-muted-foreground/50 px-4 py-2 md:px-6 md:py-3 bg-muted/10 rounded-xl md:rounded-2xl">
                                VS
                            </div>
                        )}
                        {isLive && (
                            <span className="mt-3 text-[14px] font-bold text-white bg-red-500 px-3 py-1 rounded-2xl animate-pulse uppercase">
                                {t("live")}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col items-center w-full min-w-0">
                        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-3 shrink-0 drop-shadow-xl">
                            <TeamLogo src={awayLogo} alt={awayTeamName} />
                        </div>
                        <h2 className="text-sm sm:text-base md:text-2xl font-bold leading-tight mb-1 text-center w-full text-balance">
                            {awayTeamName}
                        </h2>
                    </div>
                </div>
                {match.stadium && (
                    <div className="mt-8 md:mt-12 flex items-center justify-center gap-2 text-xs md:text-sm font-medium text-muted-foreground bg-muted/30 w-fit mx-auto px-4 py-2 rounded-full border border-border/50">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 shrink-0" />
                        <span className="text-center">{match.stadium}</span>
                    </div>
                )}
                <div className="flex items-center justify-center gap-3 md:gap-4 mt-8 md:mt-10">
                    <Button
                        asChild
                        variant="secondary"
                        className="font-semibold uppercase tracking-[0.15em] text-[10px] md:text-xs h-10 md:h-11"
                    >
                        <Link href={`/matches/${match.slug}`}>
                            {t("matchCenter")}
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="font-semibold uppercase tracking-[0.15em] text-[10px] md:text-xs h-10 md:h-11"
                    >
                        <Link href="/matches">
                            <Calendar className="w-4 h-4" />
                            {t("allMatches")}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}