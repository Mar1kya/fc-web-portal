import { prisma } from "@/lib/prisma";
import PlayerCard from "./player-card";
import CoachCard from "./coach-card";
import { PlayerPosition, TeamContext } from "../../../../../../generated/prisma";
import { getTranslations } from "next-intl/server";

type RosterListProps = {
    searchParams: { [key: string]: string | string[] | undefined };
    locale: string;
}

export default async function RosterList({ searchParams, locale }: RosterListProps) {
    const tEnums = await getTranslations("Enums");
    const tTeam = await getTranslations("TeamPage");
    const contextParam = (searchParams.context as TeamContext) || TeamContext.MAIN_TEAM;
    const posParam = searchParams.pos as string;

    if (posParam === "COACH") {
        const coaches = await prisma.coach.findMany({
            where: {
                teamContext: contextParam,
                deletedAt: null,
            },
            include: {
                translations: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        if (coaches.length === 0) {
            return (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                    {tTeam("noPlayers")}
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-10">
                <div>
                    <h2 className="text-xl font-extrabold uppercase mb-6 text-foreground">
                        {tTeam("coaches")}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {coaches.map((coach) => (
                            <CoachCard
                                key={coach.id}
                                coach={coach}
                                locale={locale}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    const players = await prisma.player.findMany({
        where: {
            teamContext: contextParam,
            ...(posParam && posParam !== "all" ? { position: posParam as PlayerPosition } : {}),
            deletedAt: null,
        },
        include: {
            translations: true,
        },
        orderBy: {
            number: "asc",
        },
    });

    if (players.length === 0) {
        return (
            <div className="col-span-full py-20 text-center text-muted-foreground">
                {tTeam("noPlayers")}
            </div>
        );
    }

    const positionOrder = [
        PlayerPosition.GOALKEEPER,
        PlayerPosition.DEFENDER,
        PlayerPosition.MIDFIELDER,
        PlayerPosition.FORWARD
    ];

    const groupedPlayers = positionOrder.map(pos => ({
        position: pos,
        players: players.filter(p => p.position === pos)
    })).filter(group => group.players.length > 0);

    return (
        <div className="flex flex-col gap-10">
            {groupedPlayers.map(group => (
                <div key={group.position}>
                    <h2 className="text-xl font-extrabold uppercase mb-6 text-foreground">
                        {tEnums(`PlayerPosition.${group.position}`)}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {group.players.map((player) => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                locale={locale}
                                positionName={tEnums(`PlayerRole.${group.position}`)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}