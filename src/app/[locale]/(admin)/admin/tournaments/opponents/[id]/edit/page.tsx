import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { EditOpponentForm } from "./_components/edit-opponent-form"

export const metadata = {
    title: "Редагувати суперника",
    description: "Оновлення інформації про команду-суперника."
}

export default async function EditOpponentPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id } = await params;

    const opponent = await prisma.opponent.findUnique({
        where: { id },
        include: {
            translations: true,
        }
    });

    if (!opponent) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Редагувати суперника</h2>
                    <p className="text-muted-foreground mt-1">
                        Оновіть інформацію про команду. Ви можете змінити назву або замінити логотип.
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
                <EditOpponentForm opponent={opponent} />
            </div>
        </div>
    )
}