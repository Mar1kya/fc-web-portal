import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { EditMatchForm } from "./_components/edit-match-form"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
    title: "Редагувати матч",
    description: "Редагування деталей матчу, складу та подій."
}

export default async function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const match = await prisma.match.findUnique({
        where: { id },
        include: {
            lineup: true,
            events: {
                orderBy: { minute: 'asc' }
            }
        }
    });

    if (!match) {
        notFound();
    }

    const [seasonsData, tournamentsData, opponentsData, playersData] = await Promise.all([
        prisma.season.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
        prisma.tournament.findMany({
            where: { deletedAt: null },
            include: { translations: { where: { language: 'uk' } } },
            orderBy: { slug: 'asc' }
        }),
        prisma.opponent.findMany({
            where: { deletedAt: null },
            include: { translations: { where: { language: 'uk' } } },
            orderBy: { slug: 'asc' }
        }),
        prisma.player.findMany({
            where: { deletedAt: null },
            include: { translations: { where: { language: 'uk' } } },
            orderBy: { number: 'asc' }
        }),
    ]);

    const seasons = seasonsData.map(s => ({ id: s.id, name: s.name }));
    const tournaments = tournamentsData.map(t => ({ id: t.id, name: t.translations[0]?.name || t.slug, hasStandings: t.hasStandings }));
    const opponents = opponentsData.map(o => ({ id: o.id, name: o.translations[0]?.name || o.slug }));
    const players = playersData.map(p => ({
        id: p.id,
        name: p.translations[0]?.name || p.slug,
        number: p.number
    }));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Редагувати матч</h2>
                    <p className="text-muted-foreground mt-1">
                        Вкладки дозволяють керувати загальною інформацією, складом та подіями.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/tournaments/matches">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до матчів
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <EditMatchForm
                    initialData={match}
                    seasons={seasons}
                    tournaments={tournaments}
                    opponents={opponents}
                    players={players}
                />
            </div>
        </div>
    )
}