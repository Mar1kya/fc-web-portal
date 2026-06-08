import { useTranslations } from "next-intl";
import { EventType, Prisma } from "../../../../../../../generated/prisma";
import { ArrowLeft, ArrowRight } from "lucide-react";

type MatchWithDetails = Prisma.MatchGetPayload<{
    include: { events: true };
}>;
export type MatchEvent = MatchWithDetails['events'][0];

const AssistIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2v20" />
        <path d="m19 15-7 7-7-7" />
        <path d="m5 9 7-7 7 7" />
    </svg>
);

export const SoccerBallIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polygon points="12 7 15 10.5 13.5 14.5 10.5 14.5 9 10.5" fill="currentColor" opacity="0.2" />
        <line x1="12" y1="7" x2="12" y2="2" />
        <line x1="15" y1="10.5" x2="20.5" y2="8.5" />
        <line x1="13.5" y1="14.5" x2="16.5" y2="20.5" />
        <line x1="10.5" y1="14.5" x2="7.5" y2="20.5" />
        <line x1="9" y1="10.5" x2="3.5" y2="8.5" />
    </svg>
);

export default function PlayerEvents({ events }: { events: MatchEvent[] }) {
    const t = useTranslations("SingleMatchPage.Lineups.Events");
    const tHero = useTranslations("SingleMatchPage.Hero");

    if (!events || events.length === 0) return null;

    return (
        <div className="flex items-center gap-2 ml-2">
            {events.map((e, idx) => {
                const isOwnGoal = e.customPlayerName?.includes("(OG)");
                const isPenalty = e.customPlayerName?.includes("(Pen.)");

                switch (e.type) {
                    case EventType.GOAL:
                        return (
                            <div key={idx} className="flex items-center gap-1" title={isOwnGoal ? tHero("ownGoal") : isPenalty ? tHero("penalty") : t("goal")}>
                                <SoccerBallIcon className={`w-3.5 h-3.5 drop-shadow-sm ${isOwnGoal ? 'text-red-500' : 'text-emerald-500'}`} />
                                <span className="text-[10px] text-muted-foreground/90 font-medium">
                                    {e.minute}&apos;
                                    {isOwnGoal && <span className="ml-0.5 text-red-500 font-bold">({tHero("ownGoal")}) впвпвп</span>}
                                </span>
                            </div>
                        );
                    case EventType.ASSIST:
                        return (
                            <div key={idx} className="flex items-center gap-1" title={t("assist")}>
                                <AssistIcon className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] text-muted-foreground/90 font-medium">{e.minute}&apos;</span>
                            </div>
                        );
                    case EventType.YELLOW_CARD:
                        return (
                            <div key={idx} className="flex items-center gap-1" title={t("yellowCard")}>
                                <div className="w-2.5 h-3.5 bg-yellow-400 border border-yellow-500/50 rounded-xs shadow-sm" />
                                <span className="text-[10px] text-muted-foreground/90 font-medium">{e.minute}&apos;</span>
                            </div>
                        );
                    case EventType.RED_CARD:
                        return (
                            <div key={idx} className="flex items-center gap-1" title={t("redCard")}>
                                <div className="w-2.5 h-3.5 bg-red-500 border border-red-600/50 rounded-xs shadow-sm" />
                                <span className="text-[10px] text-muted-foreground/90 font-medium">{e.minute}&apos;</span>
                            </div>
                        );
                    case EventType.SUBSTITUTION_IN:
                        return (
                            <div key={idx} className="flex items-center gap-1" title={t("subIn")}>
                                <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] text-muted-foreground/90 font-medium">{e.minute}&apos;</span>
                            </div>
                        );
                    case EventType.SUBSTITUTION_OUT:
                        return (
                            <div key={idx} className="flex items-center gap-1" title={t("subOut")}>
                                <ArrowLeft className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-[10px] text-muted-foreground/90 font-medium">{e.minute}&apos;</span>
                            </div>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
}