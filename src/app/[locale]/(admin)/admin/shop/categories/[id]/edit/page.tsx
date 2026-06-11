import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import { getTranslation } from "@/lib/utils/get-translation"
import { EditCategoryForm } from "./_components/edit-category-form"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const category = await prisma.category.findUnique({
        where: { id },
        include: { translations: true }
    });
    
    const name = category ? (getTranslation(category, "uk")?.name || category.slug) : "Невідомо";

    return {
        title: `Редагування категорії | ${name}`,
    };
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            translations: true,
            _count: {
                select: { products: true }
            }
        },
    })

    if (!category || category.deletedAt !== null) {
        redirect("/admin/shop/categories")
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Редагування категорії</h2>
                    <p className="text-muted-foreground mt-1">
                        Оновіть назви та переклади обраної категорії.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/shop/categories">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до списку
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <EditCategoryForm category={category} />
            </div>
        </div>
    )
}