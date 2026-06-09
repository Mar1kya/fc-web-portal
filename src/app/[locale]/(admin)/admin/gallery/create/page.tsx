import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { CreateGalleryForm } from "./_components/create-gallery-form"

export const metadata: Metadata = {
    title: "Створити галерею",
    description: "Додавання нової фото/відео галереї."
}

export default async function CreateGalleryPage() {
    const matchesData = await prisma.match.findMany({
        where: { deletedAt: null },
        orderBy: { date: 'desc' },
        include: {
            opponent: { include: { translations: { where: { language: 'uk' } } } }
        }
    });

    const matches = matchesData.map(m => {
        const opponentName = m.opponent.translations[0]?.name || m.opponent.slug;
        const dateStr = new Date(m.date).toLocaleDateString("uk-UA");
        return {
            id: m.id,
            label: `${dateStr} | Emerald Gang vs ${opponentName}`
        };
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Додати галерею</h2>
                    <p className="text-muted-foreground mt-1">
                        Завантажте фотографії та вкажіть деталі альбому.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/gallery">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до списку
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <CreateGalleryForm matches={matches} />
            </div>
        </div>
    )
}