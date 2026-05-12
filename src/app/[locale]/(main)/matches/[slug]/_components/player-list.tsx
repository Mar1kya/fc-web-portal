import PlayerEvents, { MatchEvent } from "./player-events";

export type PlayerItem = {
    id: string;
    name: string;
    number: string;
    isStarter: boolean;
    events: MatchEvent[];
};

export default function PlayerList({ players }: { players: PlayerItem[] }) {
    return (
        <ul className="flex flex-col gap-1 w-full">
            {players.map((p, idx) => (
                <li key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-muted-foreground w-6 text-right">
                            {p.number}
                        </span>
                        <span className="font-medium text-sm text-foreground">
                            {p.name}
                        </span>
                    </div>
                    <PlayerEvents events={p.events} />
                </li>
            ))}
        </ul>
    );
}