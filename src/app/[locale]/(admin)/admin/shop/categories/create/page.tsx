import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CreateCategoryForm } from "./_components/create-category-form"

export const metadata: Metadata = {
    title: "Створення категорії товарів",
    description: "Додавання нової категорії до фан-шопу."
}

export default function CreateCategoryPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Додавання категорії</h2>
                    <p className="text-muted-foreground mt-1">
                        Створіть новий розділ для товарів вашого магазину.
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
                <CreateCategoryForm />
            </div>
        </div>
    )
}