import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import { getTranslation } from "@/lib/utils/get-translation"
import { EditTournamentForm } from "./_components/edit-tournament-form"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: { translations: true }
    });
    
    const name = tournament ? (getTranslation(tournament, "uk")?.name || tournament.slug) : "Невідомо";

    return {
        title: `Редагування турніру | ${name}`,
    };
}

export default async function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: {
            translations: true,
        },
    })

    if (!tournament || tournament.deletedAt !== null) {
        redirect("/admin/tournaments/competitions")
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Редагування турніру</h2>
                    <p className="text-muted-foreground mt-1">
                        Оновіть необхідні дані турніру та його переклади.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/tournaments/competitions">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до списку
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <EditTournamentForm tournament={tournament} />
            </div>
        </div>
    )
}