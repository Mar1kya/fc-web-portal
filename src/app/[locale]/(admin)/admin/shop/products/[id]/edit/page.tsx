import { notFound } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { EditProductForm } from "./_components/edit-product-form"

export const metadata = {
    title: "Редагувати товар",
    description: "Редагування інформації, цін та медіа товару.",
}

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const product = await prisma.product.findUnique({
        where: { id, deletedAt: null },
        include: {
            translations: true,
            media: { orderBy: { id: "asc" } },
            variants: { orderBy: { position: "asc" } },
            relatedPlayers: { select: { id: true } },
        },
    })

    if (!product) {
        notFound()
    }

    const [categoriesData, playersData] = await Promise.all([
        prisma.category.findMany({
            where: { deletedAt: null },
            include: { translations: { where: { language: "uk" } } },
            orderBy: { slug: "asc" },
        }),
        prisma.player.findMany({
            where: { deletedAt: null },
            include: { translations: { where: { language: "uk" } } },
            orderBy: { number: "asc" },
        }),
    ])

    const categories = categoriesData.map((c) => ({
        id: c.id,
        name: c.translations[0]?.name ?? c.slug,
    }))

    const players = playersData.map((p) => ({
        id: p.id,
        name: p.translations[0]?.name ?? p.slug,
        number: p.number,
    }))

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Редагувати товар</h2>
                    <p className="text-muted-foreground mt-1">
                        Змініть потрібні поля та збережіть — кеш оновиться автоматично.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/shop/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до товарів
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <EditProductForm
                    initialData={{
                        ...product,
                        price: Number(product.price),
                        salePrice: product.salePrice != null ? Number(product.salePrice) : null,
                    }}
                    categories={categories}
                    players={players}
                />
            </div>
        </div>
    )
}