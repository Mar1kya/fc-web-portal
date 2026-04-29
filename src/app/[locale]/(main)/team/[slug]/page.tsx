import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlayerHero from "../_components/player-hero";

export default async function PlayerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const player = await prisma.player.findUnique({
        where: { slug, deletedAt: null },
        include: {
            translations: true,
            relatedProducts: { take: 1 },
        },
    });

    if (!player) {
        notFound();
    }

    return (
        <>
            <PlayerHero player={player} />
        </>
    );
}