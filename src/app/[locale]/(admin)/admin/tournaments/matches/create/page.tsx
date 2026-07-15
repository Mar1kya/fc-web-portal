import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CreateManualMatchForm } from "./_components/create-manual-match-form"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
    title: "Додати матч вручну",
    description: "Створення нового матчу, який ще відсутній у системі SofaScore."
}

export default async function CreateManualMatchPage() {
    const [seasonsData, tournamentsData, opponentsData] = await Promise.all([
        prisma.season.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' }
        }),
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
    ]);

    const seasons = seasonsData.map(s => ({
        id: s.id,
        name: s.name,
        startDate: s.startDate,
        endDate: s.endDate
    }));

    const tournaments = tournamentsData.map(t => ({
        id: t.id,
        name: t.translations[0]?.name || t.slug
    }));

    const opponents = opponentsData.map(o => ({
        id: o.id,
        name: o.translations[0]?.name || o.slug
    }));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Додати матч вручну</h2>
                    <p className="text-muted-foreground mt-1">
                        Заповніть форму нижче для створення матчу. Статус за замовчуванням буде Заплановано.
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
                <CreateManualMatchForm
                    seasons={seasons}
                    tournaments={tournaments}
                    opponents={opponents}
                />
            </div>
        </div>
    )
}