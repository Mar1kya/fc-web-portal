import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import { EditCoachForm } from "./_components/edit-coach-form"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    return {
        title: `Редагування тренера | ${slug}`,
    }
}

export default async function EditCoachPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const coach = await prisma.coach.findUnique({
        where: { slug },
        include: {
            translations: true,
            media: true,
        },
    })

    if (!coach || coach.deletedAt !== null) {
        redirect("/admin/team/staff")
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Редагування співробітника</h2>
                    <p className="text-muted-foreground mt-1">
                        Зміна імені призведе до автоматичної зміни адреси сторінки (slug).
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
                <EditCoachForm coach={coach} />
            </div>
        </div>
    )
}