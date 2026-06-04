import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CreateTournamentForm } from "./_components/create-tournament-form"

export const metadata: Metadata = {
    title: "Створення турніру",
    description: "Додавання нового турніру до бази даних."
}

export default function CreateTournamentPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Додавання турніру</h2>
                    <p className="text-muted-foreground mt-1">
                        Заповніть інформацію для створення нового футбольного турніру.
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
                <CreateTournamentForm />
            </div>
        </div>
    )
}