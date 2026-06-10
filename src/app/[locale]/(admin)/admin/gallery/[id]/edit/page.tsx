import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { EditGalleryForm } from "./_components/edit-gallery-form"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return {
        title: `Редагування галереї`,
        description: `Оновлення альбому (ID: ${id})`,
    }
}

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const gallery = await prisma.gallery.findUnique({
        where: { id },
        include: {
            translations: true,
            media: true,
        },
    })

    if (!gallery || gallery.deletedAt !== null) {
        redirect("/admin/gallery")
    }

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
                    <h2 className="text-3xl font-bold tracking-tight">Редагування галереї</h2>
                    <p className="text-muted-foreground mt-1">
                        Оновіть фотографії, змініть обкладинку або назву альбому.
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
                <EditGalleryForm gallery={gallery} matches={matches} />
            </div>
        </div>
    )
}