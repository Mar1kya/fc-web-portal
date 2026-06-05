"use client"

import { useState, useActionState, useEffect } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadDropzone } from "@/lib/uploadthing"
import { BoundOpponentData, createOpponent } from "@/actions/opponent"

export function CreateOpponentForm() {
    const router = useRouter();
    const [nameUk, setNameUk] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [sofascoreId, setSofascoreId] = useState<number | "">("");
    const [customLogoUrl, setCustomLogoUrl] = useState("");
    const finalLogoUrl = customLogoUrl || (sofascoreId ? `https://api.sofascore.app/api/v1/team/${sofascoreId}/image` : null);

    const boundData: BoundOpponentData = {
        name_uk: nameUk,
        name_en: nameEn,
        sofascoreId: sofascoreId === "" ? null : sofascoreId,
        logoUrl: finalLogoUrl
    };

    const createOpponentWithData = createOpponent.bind(null, boundData);
    const [state, actionFn, isPending] = useActionState(createOpponentWithData, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push("/admin/tournaments/opponents");
            router.refresh();
        } else if (state?.message && !state.success) {
            toast.error(state.message);
        }
    }, [state, router]);

    return (
        <form action={actionFn} className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 space-y-6 flex flex-col">
                <Tabs defaultValue="uk" className="w-full border rounded-lg bg-card p-4 sm:p-6 shadow-sm">
                    <TabsList className="grid w-full grid-cols-2 max-w-100 mb-6">
                        <TabsTrigger value="uk">Українська версія</TabsTrigger>
                        <TabsTrigger value="en">Англійська (Обов&apos;язково)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="uk" className="space-y-4 outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="name_uk" className="text-base font-semibold">Назва команди <span className="text-red-500">*</span></Label>
                            <Input
                                id="name_uk"
                                value={nameUk}
                                onChange={(e) => setNameUk(e.target.value)}
                                className="text-lg"
                                disabled={isPending}
                            />
                            {state?.errors?.name_uk && <p className="text-red-500 text-sm">{state.errors.name_uk[0]}</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="en" className="space-y-4 outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="name_en" className="text-base font-semibold">Назва (Англійською) <span className="text-red-500">*</span></Label>
                            <Input
                                id="name_en"
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                className="text-lg"
                                disabled={isPending}
                            />
                            {state?.errors?.name_en && <p className="text-red-500 text-sm">{state.errors.name_en[0]}</p>}
                        </div>
                    </TabsContent>
                </Tabs>
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Інтеграція з SofaScore</CardTitle>
                        <CardDescription>Введіть ID команди для автоматичного підтягування логотипу.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-w-md">
                            <Label htmlFor="sofascoreId" className="text-sm font-semibold">SofaScore ID (Опціонально)</Label>
                            <Input
                                id="sofascoreId"
                                type="number"
                                placeholder="Наприклад: 3302"
                                value={sofascoreId}
                                onChange={(e) => setSofascoreId(e.target.value === "" ? "" : Number(e.target.value))}
                                disabled={isPending}
                            />
                            <p className="text-[12px] text-muted-foreground">
                                Якщо вказати ID, логотип команди підтягнеться автоматично. Власне завантажене фото має вищий пріоритет.
                            </p>
                            {state?.errors?.sofascoreId && <p className="text-red-500 text-sm">{state.errors.sofascoreId[0]}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="xl:col-span-1 space-y-6 h-full flex flex-col">
                <Card className="h-full flex flex-col">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Власне лого</CardTitle>
                        <CardDescription>Завантажте прозоре PNG, якщо команди немає в SofaScore.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
                        {customLogoUrl ? (
                            <div className="mt-4 relative group w-40 h-40 mx-auto flex items-center justify-center">
                                <Image
                                    src={customLogoUrl}
                                    alt="Logo preview"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                                <button
                                    type="button"
                                    onClick={() => setCustomLogoUrl("")}
                                    className="absolute top-0 right-0 bg-black/50 hover:bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <UploadDropzone
                                endpoint="teamLogo"
                                onClientUploadComplete={(res) => {
                                    if (res && res.length > 0) {
                                        setCustomLogoUrl(res[0].ufsUrl || res[0].url);
                                        toast.success("Логотип успішно завантажено");
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    toast.error(`Помилка: ${error.message}`);
                                }}
                                content={{
                                    label: "Перетягніть логотип сюди",
                                    allowedContent: "Зображення до 2MB (1 шт.)",
                                    button: (uploadState) => {
                                        if (uploadState.isUploading) return "Завантаження...";
                                        if (uploadState.files && uploadState.files.length > 0) return "Завантажити";
                                        if (uploadState.ready) return "Обрати файл";
                                        return "Підготовка...";
                                    },
                                }}
                                appearance={{
                                    container: "border-2 border-dashed border-emerald-500/40 hover:border-emerald-600 transition-all bg-muted/10 py-6 focus-within:ring-0 focus-within:ring-offset-0",
                                    label: "text-emerald-600 hover:text-emerald-700 font-semibold text-sm mt-2",
                                    allowedContent: "text-muted-foreground text-xs mt-1",
                                    button: "bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 mt-3 ut-uploading:cursor-not-allowed",
                                    uploadIcon: "w-8 h-8 text-emerald-600",
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6 mt-4">
                <Button type="button" variant="outline" asChild disabled={isPending} className="w-full sm:w-32">
                    <Link href="/admin/tournaments/opponents">
                        Скасувати
                    </Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending}>
                    {isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Збереження...</>
                    ) : "Створити суперника"}
                </Button>
            </div>
        </form>
    )
}