import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CreatePlayerForm } from "./_components/create-player-form"

export const metadata: Metadata = {
    title: "Додати гравця",
    description: "Створення нового профілю гравця у команді."
}

export default function CreatePlayerPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Додати гравця</h2>
                    <p className="text-muted-foreground mt-1">
                        Заповніть форму нижче для створення профілю. Якщо ви не вкажете аватар, його можна буде підтягнути з SofaScore.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/team/players">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до команди
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <CreatePlayerForm />
            </div>
        </div>
    )
}