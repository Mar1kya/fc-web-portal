import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CreateOpponentForm } from "./_components/create-opponent-form"

export const metadata = {
    title: "Додати суперника",
    description: "Створення нової команди-суперника."
}

export default function CreateOpponentPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Додати суперника</h2>
                    <p className="text-muted-foreground mt-1">
                        Заповніть форму нижче. Якщо команда є в SofaScore, достатньо вказати лише назви та її ID.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/tournaments/opponents">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до списку
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <CreateOpponentForm />
            </div>
        </div>
    )
}