import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTranslation } from "@/lib/utils/get-translation";
import { MatchStatus } from "../../../../../../generated/prisma";

type TranslatableTournament = {
    slug: string;
    translations: { language: string; name: string }[];
};

type TranslatableOpponent = {
    logoUrl: string | null;
    translations: { language: string; name: string }[];
};

export type MatchDisplayData = {
    id: string;
    slug: string;
    date: Date;
    status: MatchStatus;
    isHomeGame: boolean;
    homeScore: number | null;
    awayScore: number | null;
    stadium: string | null;
    tournament: TranslatableTournament | null;
    opponent: TranslatableOpponent;
    round: number | null;
};

type MatchCardProps = {
    match: MatchDisplayData | null;
    title: string;
    locale: string;
    emptyText: string;
}

export default function MatchCard({ match, title, locale, emptyText }: MatchCardProps) {
    const t = useTranslations("MatchesPage");

    if (!match) {
        return (
            <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
                </div>
                <Card className="h-53 flex items-center justify-center border-dashed bg-muted/20">
                    <span className="text-sm text-muted-foreground">{emptyText}</span>
                </Card>
            </div>
        );
    }

    const translatedTournament = getTranslation(match.tournament, locale)?.name || "";
    const translatedOpponent = getTranslation(match.opponent, locale)?.name || "";
    const ourTeamName = t("ourTeamName");
    const ourLogoUrl = "https://api.sofascore.app/api/v1/team/258536/image";
    const homeTeamName = match.isHomeGame ? ourTeamName : translatedOpponent;
    const awayTeamName = match.isHomeGame ? translatedOpponent : ourTeamName;
    const homeLogo = match.isHomeGame ? ourLogoUrl : (match.opponent.logoUrl || "");
    const awayLogo = match.isHomeGame ? (match.opponent.logoUrl || "") : ourLogoUrl;

    const matchDate = new Intl.DateTimeFormat(locale, {
        day: "2-digit", month: "2-digit", year: "numeric"
    }).format(match.date);

    const matchTime = new Intl.DateTimeFormat(locale, {
        hour: "2-digit", minute: "2-digit"
    }).format(match.date);

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
                <Link href={`/matches/${match.slug}`} className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 flex items-center transition-colors">
                    {t("more")} <ChevronRight className="w-3 h-3 ml-0.5" />
                </Link>
            </div>
            <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between bg-transparent h-10 p-3">
                    <div className="flex items-center text-xs text-muted-foreground truncate pr-2 min-w-0">
                        <MapPin className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate">{match.stadium || t("noStadium")}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600/10 text-emerald-600 rounded-sm whitespace-nowrap shrink-0">
                        {translatedTournament}
                    </span>
                </CardHeader>
                <CardContent className="p-4 grow flex items-center justify-between gap-0">
                    <div className="flex flex-col gap-4 flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                                    <Image src={homeLogo} alt="" fill sizes="32px" className="object-contain" unoptimized referrerPolicy="no-referrer" />
                                </div>
                                <span
                                    className={`text-sm truncate ${match.isHomeGame ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}
                                    title={homeTeamName}
                                >
                                    {homeTeamName}
                                </span>
                            </div>
                            {(match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE) && (
                                <span className="text-xl font-black shrink-0 leading-none">
                                    {match.homeScore ?? "-"}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                                    <Image src={awayLogo} alt="" fill sizes="32px" className="object-contain" unoptimized referrerPolicy="no-referrer" />
                                </div>
                                <span
                                    className={`text-sm truncate ${!match.isHomeGame ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}
                                    title={awayTeamName}
                                >
                                    {awayTeamName}
                                </span>
                            </div>
                            {(match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE) && (
                                <span className="text-xl font-black shrink-0 leading-none">
                                    {match.awayScore ?? "-"}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center shrink-0 w-22 border-l border-border/50 pl-4 min-h-18">
                        <div className="flex flex-col items-center text-center gap-1">
                            <span className="text-sm font-bold text-foreground leading-none">{matchDate}</span>
                            <span className="text-xs font-medium text-muted-foreground">{matchTime}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-2">
                    <Button asChild variant="outline" className="w-full h-8 font-bold lg:font-normal border-border hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors">
                        <Link href={`/matches/${match.slug}`}>
                            {t("matchCenter")}
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}