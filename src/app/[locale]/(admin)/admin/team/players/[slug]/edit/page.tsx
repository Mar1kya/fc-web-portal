import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { EditPlayerForm } from "./_components/edit-player-form"


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    return {
        title: `Редагування гравця | ${slug}`,
        description: `Оновлення даних гравця | ${slug}`,
    }
}

export default async function EditPlayerPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const player = await prisma.player.findUnique({
        where: { slug },
        include: {
            translations: true,
            media: true,
        },
    })

    if (!player || player.deletedAt !== null) {
        redirect("/admin/team/players")
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Редагування профілю</h2>
                    <p className="text-muted-foreground mt-1">
                        Оновіть інформацію про гравця. Зміна імені або номера призведе до автоматичної зміни адреси сторінки (slug).
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
                <EditPlayerForm player={player} />
            </div>
        </div>
    )
}