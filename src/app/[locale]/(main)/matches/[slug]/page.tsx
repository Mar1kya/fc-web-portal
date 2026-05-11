import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import MatchHero from "./_components/match-hero";

export default async function SingleMatchPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();

    const match = await prisma.match.findUnique({
        where: { slug },
        include: {
            tournament: { include: { translations: true } },
            opponent: { include: { translations: true } },
            events: {
                include: {
                    player: { include: { translations: true } }
                }
            }
        }
    });

    if (!match) {
        notFound();
    }

    return (
        <>
            <MatchHero match={match} locale={locale} />
        </>
    );
}