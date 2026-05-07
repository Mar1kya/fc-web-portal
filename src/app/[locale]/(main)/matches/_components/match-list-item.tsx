import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getTranslation } from "@/lib/utils/get-translation";
import { MatchStatus } from "../../../../../../generated/prisma";
import { MatchDisplayData } from "./match-card";

type MatchListItemProps = {
    match: MatchDisplayData;
    locale: string;
}

export default function MatchListItem({ match, locale }: MatchListItemProps) {
    const tMatchPage = useTranslations("MatchesPage");
    const tList = useTranslations("MatchesPage.MatchList");
    const translatedTournament = getTranslation(match.tournament, locale)?.name || "";
    const translatedOpponent = getTranslation(match.opponent, locale)?.name || "";
    const ourTeamName = tMatchPage("ourTeamName");
    const ourLogoUrl = "https://api.sofascore.app/api/v1/team/258536/image";
    const homeTeamName = match.isHomeGame ? ourTeamName : translatedOpponent;
    const awayTeamName = match.isHomeGame ? translatedOpponent : ourTeamName;
    const homeLogo = match.isHomeGame ? ourLogoUrl : (match.opponent.logoUrl || "");
    const awayLogo = match.isHomeGame ? (match.opponent.logoUrl || "") : ourLogoUrl;
    const matchDate = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(match.date);

    const matchTime = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(match.date);
    const isFinishedOrLive = match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE;

    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border border-border/50 rounded-lg bg-card/50 hover:bg-muted/10 transition-colors mb-3">
            <div className="flex items-center lg:w-50 shrink-0 gap-4 lg:gap-6">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-emerald-600">{translatedTournament}</span>
                    {match.round && (
                        <span className="text-xs text-muted-foreground">
                            {tList("round", { round: match.round })}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex lg:flex-col items-center lg:items-start lg:w-30 shrink-0 gap-2 lg:gap-0">
                <span className="text-sm font-semibold">{matchTime}</span>
                <span className="text-xs text-muted-foreground">{matchDate}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground/70 mt-1">
                    {match.isHomeGame ? tList("homeGame") : tList("awayGame")}
                </span>
            </div>
            <div className="flex items-center justify-between lg:justify-center flex-1 min-w-0 gap-4">
                <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
                    <span className={`text-sm md:text-base truncate hidden sm:block ${match.isHomeGame ? 'font-bold' : 'font-medium'}`}>
                        {homeTeamName}
                    </span>
                    <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
                        <Image src={homeLogo} alt={homeTeamName} fill sizes="40px" className="object-contain" unoptimized />
                    </div>
                </div>
                <div className="flex items-center justify-center w-20 shrink-0">
                    {isFinishedOrLive ? (
                        <div className="flex items-center gap-2 text-xl font-black bg-muted/30 px-3 py-1 rounded-md">
                            <span>{match.homeScore ?? "-"}</span>
                            <span className="text-muted-foreground text-sm pb-1">-</span>
                            <span>{match.awayScore ?? "-"}</span>
                        </div>
                    ) : (
                        <span className="text-sm font-bold text-muted-foreground bg-muted/20 px-3 py-1 rounded-md">
                            vs
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-start gap-3 flex-1 min-w-0">
                    <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
                        <Image src={awayLogo} alt={awayTeamName} fill sizes="40px" className="object-contain" unoptimized />
                    </div>
                    <span className={`text-sm md:text-base truncate hidden sm:block ${!match.isHomeGame ? 'font-bold' : 'font-medium'}`}>
                        {awayTeamName}
                    </span>
                </div>
            </div>
            <div className="flex justify-end lg:w-35 shrink-0 mt-2 lg:mt-0">
                <Button asChild variant="secondary" className="w-full lg:w-auto text-white font-semibold">
                    <Link href={`/matches/${match.slug}`}>
                        {tMatchPage("matchCenter")}
                    </Link>
                </Button>
            </div>
        </div>
    );
}