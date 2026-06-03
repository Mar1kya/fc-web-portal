import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CreateCoachForm } from "./_components/create-coach-form"

export const metadata: Metadata = {
    title: "Додавання тренера",
    description: "Створення нового профілю у тренерському штабі."
}

export default function CreateCoachPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Додавання співробітника</h2>
                    <p className="text-muted-foreground mt-1">
                        Заповніть інформацію для створення нового профілю тренера.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/team/staff">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до складу
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <CreateCoachForm />
            </div>
        </div>
    )
}