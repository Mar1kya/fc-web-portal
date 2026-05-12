import { useTranslations } from "next-intl";
import { Prisma } from "../../../../../../../generated/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import PlayerList, { PlayerItem } from "./player-list";

type MatchWithDetails = Prisma.MatchGetPayload<{
    include: {
        tournament: { include: { translations: true } };
        opponent: { include: { translations: true } };
        events: { include: { player: { include: { translations: true } } } };
        lineup: { include: { player: { include: { translations: true } } } };
    };
}>;

type OpponentPlayerItem = {
    name: string;
    number: string;
    position: string;
    isStarter: boolean;
};

const positionOrder: Record<string, number> = {
    GOALKEEPER: 1,
    DEFENDER: 2,
    MIDFIELDER: 3,
    FORWARD: 4,
};

export default function MatchLineups({ match, locale }: { match: MatchWithDetails; locale: string }) {
    const t = useTranslations("SingleMatchPage.Lineups");
    const tHero = useTranslations("SingleMatchPage.Hero");
    const translatedOpponent = getTranslation(match.opponent, locale)?.name || "";
    const ourTeamName = tHero("ourTeamName");
    const homeTeamName = match.isHomeGame ? ourTeamName : translatedOpponent;
    const awayTeamName = match.isHomeGame ? translatedOpponent : ourTeamName;
    const homeCoach = match.isHomeGame ? match.homeCoachName : match.awayCoachName;
    const awayCoach = match.isHomeGame ? match.awayCoachName : match.homeCoachName;

    const ourLineup: PlayerItem[] = (match.lineup || []).map(entry => {
        const translatedPlayer = getTranslation(entry.player, locale);
        return {
            id: entry.player.id,
            name: translatedPlayer?.name || entry.player.slug,
            number: entry.player.number.toString(),
            positionOrder: positionOrder[entry.player.position] || 99,
            isStarter: entry.isStarter,
            events: match.events.filter(e => !e.isOpponent && e.playerId === entry.player.id)
        };
    }).sort((a, b) => a.positionOrder - b.positionOrder);

    const opponentLineupRaw = (match.opponentLineup as OpponentPlayerItem[]) || [];
    const opponentLineup: PlayerItem[] = opponentLineupRaw.map(entry => ({
        id: entry.name,
        name: entry.name,
        number: entry.number,
        isStarter: entry.isStarter,
        events: match.events.filter(e => e.isOpponent && e.customPlayerName === entry.name)
    }));

    const homeLineup = match.isHomeGame ? ourLineup : opponentLineup;
    const awayLineup = match.isHomeGame ? opponentLineup : ourLineup;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-4">
            <div className="flex flex-col bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-black text-center mb-6 border-b border-border pb-4">{homeTeamName}</h3>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">{t("startingXI")}</h4>
                <PlayerList players={homeLineup.filter(p => p.isStarter)} />
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-8 mb-3 px-2">{t("substitutes")}</h4>
                <PlayerList players={homeLineup.filter(p => !p.isStarter)} />
                {homeCoach && (
                    <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between px-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">{t("coach")}</span>
                        <span className="text-sm font-semibold">{homeCoach}</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-black text-center mb-6 border-b border-border pb-4">{awayTeamName}</h3>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">{t("startingXI")}</h4>
                <PlayerList players={awayLineup.filter(p => p.isStarter)} />
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-8 mb-3 px-2">{t("substitutes")}</h4>
                <PlayerList players={awayLineup.filter(p => !p.isStarter)} />
                {awayCoach && (
                    <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between px-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">{t("coach")}</span>
                        <span className="text-sm font-semibold">{awayCoach}</span>
                    </div>
                )}
            </div>
        </div>
    );
}