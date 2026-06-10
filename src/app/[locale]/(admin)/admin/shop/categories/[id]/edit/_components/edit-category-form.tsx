"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryWithRelations } from "../../../_components/columns"
import { BoundCategoryData, updateCategory } from "@/actions/category"

interface EditCategoryFormProps {
    category: CategoryWithRelations;
}

export function EditCategoryForm({ category }: EditCategoryFormProps) {
    const router = useRouter();
    const txUk = category.translations.find(t => t.language === "uk");
    const txEn = category.translations.find(t => t.language === "en");
    
    const [nameUk, setNameUk] = useState(txUk?.name || "");
    const [nameEn, setNameEn] = useState(txEn?.name || "");

    const boundData: BoundCategoryData = {
        name_uk: nameUk,
        name_en: nameEn,
    };

    const updateCategoryWithId = updateCategory.bind(null, category.id, boundData);
    const [state, actionFn, isPending] = useActionState(updateCategoryWithId, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push("/admin/shop/categories");
            router.refresh();
        } else if (state?.message && !state.success) {
            toast.error(state.message);
        }
    }, [state, router]);

    return (
        <form action={actionFn} className="space-y-8">
            <div className="space-y-6">
                <Tabs defaultValue="uk" className="w-full border rounded-lg bg-card p-4 sm:p-6 shadow-sm">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="uk">Українська версія</TabsTrigger>
                        <TabsTrigger value="en">Англійська версія</TabsTrigger>
                    </TabsList>
                    <TabsContent value="uk" className="space-y-4 outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="name_uk" className="text-base font-semibold">
                                Назва категорії <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name_uk"
                                placeholder="Наприклад: Ігрова форма"
                                value={nameUk}
                                onChange={(e) => setNameUk(e.target.value)}
                                className="text-lg max-w-xl"
                                disabled={isPending}
                            />
                            {state?.errors?.name_uk && <p className="text-red-500 text-sm">{state.errors.name_uk[0]}</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="en" className="space-y-4 outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="name_en" className="text-base font-semibold">
                                Назва категорії (Англійська) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name_en"
                                placeholder="Наприклад: Match Kits"
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                className="text-lg max-w-xl"
                                disabled={isPending}
                            />
                            {state?.errors?.name_en && <p className="text-red-500 text-sm">{state.errors.name_en[0]}</p>}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6 mt-4">
                <Button type="button" variant="outline" asChild disabled={isPending} className="w-full sm:w-32">
                    <Link href="/admin/shop/categories">
                        Скасувати
                    </Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending}>
                    {isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Оновлення...</>
                    ) : "Оновити категорію"}
                </Button>
            </div>
        </form>
    );
}