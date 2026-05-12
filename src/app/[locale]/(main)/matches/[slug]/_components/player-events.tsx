import { useTranslations } from "next-intl";
import { EventType, Prisma } from "../../../../../../../generated/prisma";
import { ArrowRight, ArrowLeft } from "lucide-react";

type MatchWithDetails = Prisma.MatchGetPayload<{
    include: { events: true };
}>;
export type MatchEvent = MatchWithDetails['events'][0];

export const SoccerBallIcon = ({ className }: { className?: string }) => (
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

export default function PlayerEvents({ events }: { events: MatchEvent[] }) {
    const t = useTranslations("SingleMatchPage.Lineups.Events");

    if (!events || events.length === 0) return null;

    return (
        <div className="flex items-center gap-1.5 ml-2">
            {events.map((e, idx) => {
                switch (e.type) {
                    case EventType.GOAL:
                        return <div key={idx} className="flex items-center gap-0.5" title={t("goal")}><SoccerBallIcon className="w-3.5 h-3.5 text-emerald-600" /><span className="text-[10px] text-muted-foreground">{e.minute}&apos;</span></div>;
                    case EventType.ASSIST:
                        return <span key={idx} className="text-xs font-bold text-muted-foreground" title={t("assist")}>A</span>;
                    case EventType.YELLOW_CARD:
                        return <div key={idx} className="flex items-center gap-0.5" title={t("yellowCard")}><div className="w-2.5 h-3.5 bg-yellow-400 rounded-[1px]" /><span className="text-[10px] text-muted-foreground">{e.minute}&apos;</span></div>;
                    case EventType.RED_CARD:
                        return <div key={idx} className="flex items-center gap-0.5" title={t("redCard")}><div className="w-2.5 h-3.5 bg-red-600 rounded-[1px]" /><span className="text-[10px] text-muted-foreground">{e.minute}&apos;</span></div>;
                    case EventType.SUBSTITUTION_IN:
                        return <div key={idx} className="flex items-center gap-0.5" title={t("subIn")}><ArrowRight className="w-3.5 h-3.5 text-emerald-500" /><span className="text-[10px] text-muted-foreground">{e.minute}&apos;</span></div>;
                    case EventType.SUBSTITUTION_OUT:
                        return <div key={idx} className="flex items-center gap-0.5" title={t("subOut")}><ArrowLeft className="w-3.5 h-3.5 text-red-500" /><span className="text-[10px] text-muted-foreground">{e.minute}&apos;</span></div>;
                    default:
                        return null;
                }
            })}
        </div>
    );
}