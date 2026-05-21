import PlayerEvents, { MatchEvent } from "./player-events";
import { Link } from "@/i18n/navigation";

export type PlayerItem = {
    id: string;
    name: string;
    number: string;
    isStarter: boolean;
    slug?: string;
    events: MatchEvent[];
};

export default function PlayerList({ players }: { players: PlayerItem[] }) {
    return (
        <ul className="flex flex-col gap-1 w-full">
            {players.map((p, idx) => (
                <li key={idx} className="flex items-center justify-between p-1.5 md:p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                    {p.slug ? (
                        <Link
                            href={`/team/${p.slug}`}
                            className="group flex items-center gap-3 flex-1 min-w-0 outline-none rounded-sm cursor-pointer"
                        >
                            <span className="font-mono text-sm font-bold text-muted-foreground group-hover:text-emerald-600 transition-colors w-6 text-right shrink-0">
                                {p.number}
                            </span>
                            <span className="font-medium text-sm text-foreground group-hover:text-emerald-600 transition-colors truncate">
                                {p.name}
                            </span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="font-mono text-sm font-bold text-muted-foreground w-6 text-right shrink-0">
                                {p.number}
                            </span>
                            <span className="font-medium text-sm text-foreground truncate">
                                {p.name}
                            </span>
                        </div>
                    )}
                    <div className="shrink-0 ml-2">
                        <PlayerEvents events={p.events} />
                    </div>
                </li>
            ))}
        </ul>
    );
}