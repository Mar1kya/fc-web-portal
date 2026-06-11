import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { CreateProductForm } from "./_components/create-product-form"

export const metadata: Metadata = {
    title: "Додати товар",
    description: "Створення нового товару у фаншопі."
}

export default async function CreateProductPage() {
    const [categoriesData, playersData] = await Promise.all([
        prisma.category.findMany({
            where: { deletedAt: null },
            include: { translations: { where: { language: 'uk' } } },
            orderBy: { slug: 'asc' }
        }),
        prisma.player.findMany({
            where: { deletedAt: null }, 
            include: { translations: { where: { language: 'uk' } } },
            orderBy: [{ number: 'asc' }, { slug: 'asc' }]
        }),
    ]);

    const categories = categoriesData.map(c => ({
        id: c.id,
        name: c.translations[0]?.name || c.slug
    }));

    const players = playersData.map(p => {
        const translation = p.translations?.[0];
        const playerName = translation?.name || p.slug;

        return {
            id: p.id,
            name: playerName, 
            number: p.number
        };
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Додати товар</h2>
                    <p className="text-muted-foreground mt-1">
                        Заповніть інформацію, додайте розміри та фотографії.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/shop/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до каталогу
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <CreateProductForm
                    categories={categories}
                    players={players}
                />
            </div>
        </div>
    )
}