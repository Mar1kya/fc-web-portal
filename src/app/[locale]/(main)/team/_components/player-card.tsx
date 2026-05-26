import { Link } from "@/i18n/navigation";
import { Player } from "../../../../../../generated/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import Flag from "react-world-flags";
import { User } from "lucide-react";
import PlayerCardAvatar from "./player-card-avatar";

type PlayerCardProps = {
    player: Player & {
        translations: { name: string; language: string }[];
    };
    locale: string;
    positionName: string;
}

export default async function PlayerCard({ player, locale, positionName }: PlayerCardProps) {
    const translation = getTranslation(player, locale);
    const fallbackName = locale === 'uk' ? "Без назви" : "Untitled";
    const name = translation?.name || fallbackName;
    return (
        <Link
            href={`/team/${player.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md"
        >
            <div className="absolute right-2 top-0 select-none text-5xl font-black text-foreground/5">
                {player.number}
            </div>
            <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
                {player.avatar ? (
                    <PlayerCardAvatar src={player.avatar} alt={name} />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/30 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/40">
                        <User className="w-16 h-16" strokeWidth={1.5} />
                    </div>
                )}
            </div>
            <div className="relative flex flex-col p-3 border-t bg-card">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-600">#{player.number}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            {positionName}
                        </span>
                    </div>
                    {player.nationality && (
                        <Flag
                            code={player.nationality}
                            className="h-3.5 w-5 rounded-xs object-cover shadow-sm"
                            fallback={<span className="text-[10px] font-medium text-muted-foreground uppercase">{player.nationality}</span>}
                        />
                    )}
                </div>
                <h3 className="line-clamp-1 text-base font-bold uppercase tracking-tight">
                    {name}
                </h3>
            </div>
        </Link>
    );
}