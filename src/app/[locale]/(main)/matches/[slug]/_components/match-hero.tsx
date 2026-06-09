import { useTranslations } from "next-intl";
import { CalendarDays, MapPin } from "lucide-react";
import { MatchStatus, Prisma } from "../../../../../../../generated/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import TeamLogo from "./team-logo";

const SoccerBallIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polygon points="12 7 15 10.5 13.5 14.5 10.5 14.5 9 10.5" />
        <line x1="12" y1="7" x2="12" y2="2" />
        <line x1="15" y1="10.5" x2="20.5" y2="8.5" />
        <line x1="13.5" y1="14.5" x2="16.5" y2="20.5" />
        <line x1="10.5" y1="14.5" x2="7.5" y2="20.5" />
        <line x1="9" y1="10.5" x2="3.5" y2="8.5" />
    </svg>
);

type MatchWithDetails = Prisma.MatchGetPayload<{
    include: {
        tournament: { include: { translations: true } };
        opponent: { include: { translations: true } };
        events: { include: { player: { include: { translations: true } } } };
    };
}>;

type MatchHeroProps = {
    match: MatchWithDetails;
    locale: string;
}

export default function MatchHero({ match, locale }: MatchHeroProps) {
    const t = useTranslations("SingleMatchPage.Hero");
    const translatedTournament = getTranslation(match.tournament, locale)?.name || "";
    const translatedOpponent = getTranslation(match.opponent, locale)?.name || "";
    const ourTeamName = t("ourTeamName");
    const ourLogoUrl = "https://api.sofascore.app/api/v1/team/258536/image";
    const homeTeamName = match.isHomeGame ? ourTeamName : translatedOpponent;
    const awayTeamName = match.isHomeGame ? translatedOpponent : ourTeamName;
    const homeLogo = match.isHomeGame ? ourLogoUrl : (match.opponent?.logoUrl || "");
    const awayLogo = match.isHomeGame ? (match.opponent?.logoUrl || "") : ourLogoUrl;
    const homeCoach = match.homeCoachName;
    const awayCoach = match.awayCoachName;

    const matchDate = new Intl.DateTimeFormat(locale, {
        day: "2-digit", month: "2-digit", year: "numeric"
    }).format(match.date).replace(/\./g, '/');

    const matchTime = new Intl.DateTimeFormat(locale, {
        hour: "2-digit", minute: "2-digit"
    }).format(match.date);

    const isFinishedOrLive = match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE;
    const allEvents = match.events || [];
    const goals = allEvents.filter(e => e.type === "GOAL");

    const isOwnGoal = (customName: string | null) => (customName || "").includes("(OG)");
    const homeGoalsRaw = goals.filter(e => {
        const isHomeTeamPlayer = match.isHomeGame ? !e.isOpponent : e.isOpponent;
        const og = isOwnGoal(e.customPlayerName);
        return og ? !isHomeTeamPlayer : isHomeTeamPlayer;
    });

    const awayGoalsRaw = goals.filter(e => {
        const isHomeTeamPlayer = match.isHomeGame ? !e.isOpponent : e.isOpponent;
        const og = isOwnGoal(e.customPlayerName);
        return og ? isHomeTeamPlayer : !isHomeTeamPlayer;
    });

    const groupGoals = (goalEvents: typeof goals) => {
        const map = new Map<string, number[]>();
        goalEvents.forEach(g => {
            let name = t("unknownPlayer");

            if (g.player) {
                const translatedPlayer = getTranslation(g.player, locale);
                name = translatedPlayer?.name || g.player.slug || name;
                if (g.customPlayerName) {
                    if (g.customPlayerName.includes("(OG)")) name += " (OG)";
                    if (g.customPlayerName.includes("(Pen.)")) name += " (Pen.)";
                }
            }
            else if (g.customPlayerName) {
                name = g.customPlayerName;
            }

            if (!map.has(name)) map.set(name, []);
            map.get(name)!.push(g.minute);
        });

        return Array.from(map.entries())
            .map(([name, minutes]) => ({
                name,
                minutes: minutes.sort((a, b) => a - b)
            }))
            .sort((a, b) => a.minutes[0] - b.minutes[0]);
    };

    const homeGoalScorers = groupGoals(homeGoalsRaw);
    const awayGoalScorers = groupGoals(awayGoalsRaw);

    return (
        <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-10 shadow-sm relative w-full overflow-hidden">
            <div className="flex flex-col items-center justify-center gap-1.5 mb-6 md:mb-10 text-center">
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                    <span className="text-emerald-600 font-black uppercase tracking-wider text-xl md:text-2xl">
                        {translatedTournament}
                    </span>
                    {match.round && (
                        <>
                            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-border" />
                            <span className="text-muted-foreground uppercase tracking-wide font-bold text-sm md:text-base">
                                {t("round", { round: match.round })}
                            </span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-medium mt-1 text-sm md:text-base">
                    <CalendarDays className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{matchDate} • {matchTime}</span>
                </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-start w-full gap-2 md:gap-8">
                <div className="flex flex-col items-center w-full min-w-0">
                    <div className="relative w-14 h-14 md:w-28 md:h-28 mb-3 shrink-0">
                        <TeamLogo src={homeLogo} alt={homeTeamName} />
                    </div>
                    <h2 className="text-sm sm:text-base md:text-3xl font-bold leading-tight mb-1 text-center w-full text-balance">
                        {homeTeamName}
                    </h2>
                    {homeCoach && (
                        <p className="text-[10px] md:text-sm text-muted-foreground text-center w-full text-balance">
                            <span className="hidden lg:inline">{t("coach")}: </span>
                            <span className="font-semibold text-foreground/80">{homeCoach}</span>
                        </p>
                    )}
                    {homeGoalScorers.length > 0 && (
                        <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
                            {homeGoalScorers.map((scorer, idx) => {
                                let displayName = scorer.name;
                                if (displayName.includes("(OG)")) displayName = displayName.replace("(OG)", `(${t("ownGoal")})`);
                                if (displayName.includes("(Pen.)")) displayName = displayName.replace("(Pen.)", `(${t("penalty")})`);

                                return (
                                    <div key={idx} className="flex items-center justify-center gap-1.5 md:gap-2.5 bg-muted/20 px-2 py-1 md:px-3 md:py-1.5 rounded-md border border-border/50 w-fit max-w-full">
                                        <span className="font-semibold text-foreground text-[10px] md:text-sm text-left wrap-break-word leading-tight">
                                            {displayName}
                                        </span>
                                        <span className="text-muted-foreground text-[10px] md:text-sm whitespace-nowrap">
                                            {scorer.minutes.join("', ")}&apos;
                                        </span>
                                        <SoccerBallIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-600 shrink-0" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center justify-start mt-2 md:mt-6 px-1 md:px-4 shrink-0">
                    {isFinishedOrLive ? (
                        <div className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter flex items-center gap-2 md:gap-5 bg-muted/20 px-3 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-border/50">
                            <span>{match.homeScore ?? "-"}</span>
                            <span className="text-muted-foreground/30 text-2xl md:text-5xl">:</span>
                            <span>{match.awayScore ?? "-"}</span>
                        </div>
                    ) : (
                        <div className="text-xl md:text-5xl font-black text-muted-foreground/50 px-4 py-2 md:px-6 md:py-3 bg-muted/10 rounded-xl md:rounded-2xl">
                            VS
                        </div>
                    )}
                    {match.status === MatchStatus.LIVE && (
                        <span className="mt-3 text-[10px] md:text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full animate-pulse uppercase">
                            {t("live")}
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-center w-full min-w-0">
                    <div className="relative w-14 h-14 md:w-28 md:h-28 mb-3 shrink-0">
                        <TeamLogo src={awayLogo} alt={awayTeamName} />
                    </div>
                    <h2 className="text-sm sm:text-base md:text-3xl font-bold leading-tight mb-1 text-center w-full text-balance">
                        {awayTeamName}
                    </h2>
                    {awayCoach && (
                        <p className="text-[10px] md:text-sm text-muted-foreground text-center w-full text-balance">
                            <span className="hidden lg:inline">{t("coach")}: </span>
                            <span className="font-semibold text-foreground/80">{awayCoach}</span>
                        </p>
                    )}
                    {awayGoalScorers.length > 0 && (
                        <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
                            {awayGoalScorers.map((scorer, idx) => {
                                let displayName = scorer.name;
                                if (displayName.includes("(OG)")) displayName = displayName.replace("(OG)", `(${t("ownGoal")})`);
                                if (displayName.includes("(Pen.)")) displayName = displayName.replace("(Pen.)", `(${t("penalty")})`);

                                return (
                                    <div key={idx} className="flex items-center justify-center gap-1.5 md:gap-2.5 bg-muted/20 px-2 py-1 md:px-3 md:py-1.5 rounded-md border border-border/50 w-fit max-w-full">
                                        <span className="font-semibold text-foreground text-[10px] md:text-sm text-left wrap-break-word leading-tight">
                                            {displayName}
                                        </span>
                                        <span className="text-muted-foreground text-[10px] md:text-sm whitespace-nowrap">
                                            {scorer.minutes.join("', ")}&apos;
                                        </span>
                                        <SoccerBallIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-600 shrink-0" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {match.stadium && (
                <div className="mt-8 md:mt-12 flex items-center justify-center gap-2 text-xs md:text-sm font-medium text-muted-foreground bg-muted/30 w-fit mx-auto px-4 py-2 rounded-full border border-border/50">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
                    <span className="text-center">{match.stadium}</span>
                </div>
            )}
        </div>
    );
}