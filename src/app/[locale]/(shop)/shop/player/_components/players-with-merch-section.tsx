import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { User2 } from "lucide-react";
import PlayersTeamFilter from "./players-team-filter";
import { TeamContext } from "../../../../../../../generated/prisma";
import PlayerCardAvatar from "@/app/[locale]/(main)/team/_components/player-card-avatar";

export default async function PlayersWithMerchSection({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const locale = await getLocale();
    const t = await getTranslations("Shop.PlayersCatalog");

    const grouped = await prisma.player.groupBy({
        by: ["teamContext"],
        where: {
            deletedAt: null,
            relatedProducts: {
                some: {
                    deletedAt: null,
                    isArchived: false,
                },
            },
        },
    });
    const availableTeamContexts = grouped.map((g) => g.teamContext);

    if (availableTeamContexts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl border-dashed border-border bg-muted/10">
                <p className="text-muted-foreground text-lg">{t("empty")}</p>
            </div>
        );
    }

    const defaultTeam = availableTeamContexts.includes(TeamContext.MAIN_TEAM)
        ? TeamContext.MAIN_TEAM
        : availableTeamContexts[0];

    const teamParam = typeof searchParams.team === "string" ? searchParams.team : undefined;

    let teamFilter: TeamContext = defaultTeam;
    let isInvalidSearch = false;
    if (teamParam) {
        if (availableTeamContexts.includes(teamParam as TeamContext)) {
            teamFilter = teamParam as TeamContext;
        } else {
            isInvalidSearch = true;
        }
    }

    const filterNode = availableTeamContexts.length > 1 && (
        <div className="flex justify-center md:justify-end">
            <PlayersTeamFilter
                availableTeamContexts={availableTeamContexts}
                defaultTeam={defaultTeam}
            />
        </div>
    );

    if (isInvalidSearch) {
        return (
            <div className="flex flex-col gap-6">
                {filterNode}
                <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl border-dashed border-border bg-muted/10">
                    <p className="text-muted-foreground text-lg">{t("empty")}</p>
                </div>
            </div>
        );
    }

    const playersWithMerch = await prisma.player.findMany({
        where: {
            deletedAt: null,
            teamContext: teamFilter,
            relatedProducts: {
                some: {
                    deletedAt: null,
                    isArchived: false,
                }
            }
        },
        include: {
            translations: true,
        },
        orderBy: {
            number: 'asc'
        }
    });

    if (playersWithMerch.length === 0) {
        return (
            <div className="flex flex-col gap-6">
                {filterNode}
                <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl border-dashed border-border bg-muted/10">
                    <p className="text-muted-foreground text-lg">{t("empty")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {filterNode}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {playersWithMerch.map((player) => {
                    const translation = getTranslation(player, locale);
                    const playerName = translation?.name || player.slug;

                    return (
                        <Link
                            key={player.id}
                            href={`/shop/player/${player.slug}`}
                            className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-emerald-600/50 hover:shadow-lg hover:shadow-emerald-600/10 transition-all duration-300"
                        >
                            <div className="relative aspect-3/4 w-full bg-muted/30 flex items-end justify-center overflow-hidden">
                                {player.avatar ? (
                                    <PlayerCardAvatar src={player.avatar} alt={player.slug} />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                                        <User2 className="h-24 w-24" />
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />
                                <div className="absolute -right-2 -bottom-4 text-[100px] font-black leading-none text-white/10 group-hover:text-emerald-500/20 transition-colors duration-300 pointer-events-none">
                                    {player.number}
                                </div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between z-10">
                                <div className="flex flex-col">
                                    <span className="text-emerald-400 font-bold text-sm">#{player.number}</span>
                                    <span className="text-white font-black text-lg uppercase leading-tight line-clamp-2">
                                        {playerName}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}