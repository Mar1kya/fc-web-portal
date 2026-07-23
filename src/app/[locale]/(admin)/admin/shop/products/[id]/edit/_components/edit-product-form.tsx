"use client"

import { useState, useActionState, useEffect } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { BoundProductData, updateProduct } from "@/actions/product"
import { UploadDropzone } from "@/lib/uploadthing"
import Image from "next/image"
import { STANDARD_SIZES } from "@/lib/constants"
import { Demographic } from "../../../../../../../../../../generated/prisma"

type SelectOption = { id: string; name: string; number?: number | null }

type ProductWithDetails = {
    id: string
    slug: string
    price: number
    salePrice: number | null
    isOnSale: boolean
    isFeatured: boolean
    isArchived: boolean
    demographic: Demographic
    color: string | null
    apparelType: string | null
    seasonYear: string | null
    matchType: string | null
    categoryId: string
    translations: { language: string; name: string; description: string }[]
    media: { url: string }[]
    variants: { size: string; stock: number; sku: string | null }[]
    relatedPlayers: { id: string }[]
}

type EditProductFormProps = {
    initialData: ProductWithDetails
    categories: SelectOption[]
    players: SelectOption[]
}

type VariantItem = {
    id: string
    size: string
    stock: number
    sku: string
}

export function EditProductForm({ initialData, categories, players }: EditProductFormProps) {
    const router = useRouter()
    const ukTranslation = initialData.translations.find((t) => t.language === "uk")
    const enTranslation = initialData.translations.find((t) => t.language === "en")
    const [nameUk, setNameUk] = useState(ukTranslation?.name ?? "")
    const [nameEn, setNameEn] = useState(enTranslation?.name ?? "")
    const [descUk, setDescUk] = useState(ukTranslation?.description ?? "")
    const [descEn, setDescEn] = useState(enTranslation?.description ?? "")
    const [categoryId, setCategoryId] = useState(initialData.categoryId)
    const [demographic, setDemographic] = useState<Demographic>(initialData.demographic)
    const [price, setPrice] = useState<number | "">(Number(initialData.price))
    const [salePrice, setSalePrice] = useState<number | "">(
        initialData.salePrice != null ? Number(initialData.salePrice) : ""
    )
    const [isOnSale, setIsOnSale] = useState(initialData.isOnSale)
    const [isFeatured, setIsFeatured] = useState(initialData.isFeatured)
    const [isArchived, setIsArchived] = useState(initialData.isArchived)
    const [color, setColor] = useState(initialData.color ?? "")
    const [apparelType, setApparelType] = useState(initialData.apparelType ?? "")
    const [seasonYear, setSeasonYear] = useState(initialData.seasonYear ?? "")
    const [matchType, setMatchType] = useState(initialData.matchType ?? "")
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
        initialData.relatedPlayers.map((p) => p.id)
    )

    const [variants, setVariants] = useState<VariantItem[]>(() =>
        initialData.variants.map((v) => ({
            id: crypto.randomUUID(),
            size: v.size.toUpperCase().trim(),
            stock: v.stock,
            sku: v.sku ?? "",
        }))
    )

    const [mediaUrls, setMediaUrls] = useState<string[]>(initialData.media.map((m) => m.url))


    const togglePlayer = (playerId: string) => {
        setSelectedPlayers((prev) =>
            prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
        )
    }

    const addVariant = () => {
        setVariants((prev) => [...prev, { id: crypto.randomUUID(), size: "", stock: 0, sku: "" }])
    }

    const updateVariant = <K extends keyof VariantItem>(index: number, field: K, value: VariantItem[K]) => {
        setVariants((prev) => {
            const next = [...prev]
            next[index] = { ...next[index], [field]: value }
            return next
        })
    }

    const removeVariant = (index: number) => {
        setVariants((prev) => prev.filter((_, i) => i !== index))
    }

    const removeImage = (urlToRemove: string) => {
        setMediaUrls((prev) => prev.filter((url) => url !== urlToRemove))
    }

    const boundData: BoundProductData = {
        name_uk: nameUk,
        name_en: nameEn,
        description_uk: descUk,
        description_en: descEn,
        categoryId,
        demographic,
        price: Number(price),
        salePrice: salePrice === "" ? null : Number(salePrice),
        isOnSale,
        isFeatured,
        isArchived,
        color: color || null,
        apparelType: apparelType || null,
        seasonYear: seasonYear || null,
        matchType: matchType || null,
        relatedPlayerIds: selectedPlayers,
        variants: variants.map((v) => ({ size: v.size, stock: v.stock, sku: v.sku || null })),
        mediaUrls,
    }

    const updateProductWithId = updateProduct.bind(null, initialData.id, boundData)
    const [state, actionFn, isPending] = useActionState(updateProductWithId, undefined)

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message)
            router.push("/admin/shop/products")
            router.refresh()
        } else if (state?.message && !state.success) {
            toast.error(state.message)
        }
    }, [state, router])


    return (
        <form action={actionFn} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
                <TabsList className="flex flex-wrap w-full max-w-fit mb-6 justify-start h-auto gap-1">
                    <TabsTrigger
                        value="basic"
                        className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border rounded-md px-4 py-2"
                    >
                        Базова інформація
                    </TabsTrigger>
                    <TabsTrigger
                        value="price"
                        className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border rounded-md px-4 py-2"
                    >
                        Ціни та Статус
                    </TabsTrigger>
                    <TabsTrigger
                        value="attributes"
                        className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border rounded-md px-4 py-2"
                    >
                        Атрибути та Гравці
                    </TabsTrigger>
                    <TabsTrigger
                        value="variants"
                        className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border rounded-md px-4 py-2"
                    >
                        Розміри ({variants.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="media"
                        className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border rounded-md px-4 py-2"
                    >
                        Фотографії
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                        <div className="xl:col-span-2 space-y-6 flex flex-col">
                            <Tabs defaultValue="uk" className="w-full border rounded-lg bg-card p-4 sm:p-6 shadow-sm">
                                <TabsList className="grid w-full grid-cols-2 max-w-100 mb-6">
                                    <TabsTrigger value="uk">Українська версія</TabsTrigger>
                                    <TabsTrigger value="en">Англійська версія</TabsTrigger>
                                </TabsList>
                                <TabsContent value="uk" className="space-y-4 outline-none">
                                    <div className="space-y-2">
                                        <Label htmlFor="name_uk" className="text-base font-semibold">
                                            Назва товару <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name_uk"
                                            value={nameUk}
                                            onChange={(e) => setNameUk(e.target.value)}
                                            className="text-lg"
                                            disabled={isPending}
                                        />
                                        {state?.errors?.name_uk && (
                                            <p className="text-red-500 text-sm">{state.errors.name_uk[0]}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <Label className="text-base font-semibold">
                                            Опис товару <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="w-full">
                                            <RichTextEditor value={descUk} onChange={setDescUk} disabled={isPending} />
                                        </div>
                                        {state?.errors?.description_uk && (
                                            <p className="text-red-500 text-sm">{state.errors.description_uk[0]}</p>
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent value="en" className="space-y-4 outline-none">
                                    <div className="space-y-2">
                                        <Label htmlFor="name_en" className="text-base font-semibold">
                                            Назва товару (Англійська) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name_en"
                                            value={nameEn}
                                            onChange={(e) => setNameEn(e.target.value)}
                                            className="text-lg"
                                            disabled={isPending}
                                        />
                                        {state?.errors?.name_en && (
                                            <p className="text-red-500 text-sm">{state.errors.name_en[0]}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <Label className="text-base font-semibold">
                                            Опис товару (Англійська) <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="w-full">
                                            <RichTextEditor value={descEn} onChange={setDescEn} disabled={isPending} />
                                        </div>
                                        {state?.errors?.description_en && (
                                            <p className="text-red-500 text-sm">{state.errors.description_en[0]}</p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        <div className="xl:col-span-1 space-y-6 h-full flex flex-col">
                            <Card className="shadow-none border-border/50 h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">Класифікація</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col space-y-6">
                                    <div className="space-y-2">
                                        <Label>
                                            Категорія <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={categoryId} onValueChange={setCategoryId} disabled={isPending}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Оберіть категорію" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {state?.errors?.categoryId && (
                                            <p className="text-red-500 text-xs">{state.errors.categoryId[0]}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Для кого (Стать/Вік)</Label>
                                        <Select
                                            value={demographic}
                                            onValueChange={(v) => setDemographic(v as Demographic)}
                                            disabled={isPending}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={Demographic.UNISEX}>Унісекс</SelectItem>
                                                <SelectItem value={Demographic.MEN}>Чоловіки</SelectItem>
                                                <SelectItem value={Demographic.WOMEN}>Жінки</SelectItem>
                                                <SelectItem value={Demographic.KIDS}>Діти</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="price" className="outline-none">
                    <Card className="shadow-none border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Ціноутворення</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                                <div className="space-y-2">
                                    <Label>
                                        Звичайна ціна (₴) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                                        disabled={isPending}
                                    />
                                    {state?.errors?.price && (
                                        <p className="text-red-500 text-xs">{state.errors.price[0]}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Акційна ціна (₴)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : "")}
                                        disabled={isPending || !isOnSale}
                                    />
                                    {state?.errors?.salePrice && (
                                        <p className="text-red-500 text-xs">{state.errors.salePrice[0]}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t max-w-3xl">
                                <div className="flex flex-row items-center justify-between rounded-lg border p-3 bg-muted/10">
                                    <div>
                                        <Label className="text-base cursor-pointer">Акція (Розпродаж)</Label>
                                        <p className="text-xs text-muted-foreground">Увімкніть, щоб застосувати акційну ціну.</p>
                                    </div>
                                    <Switch checked={isOnSale} onCheckedChange={setIsOnSale} disabled={isPending} />
                                </div>
                                <div className="flex flex-row items-center justify-between rounded-lg border p-3 bg-muted/10">
                                    <div>
                                        <Label className="text-base cursor-pointer">Топ продажу (Featured)</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Товар буде виділений на головній сторінці магазину.
                                        </p>
                                    </div>
                                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} disabled={isPending} />
                                </div>
                                <div className="flex flex-row items-center justify-between rounded-lg border p-3 bg-destructive/5">
                                    <div>
                                        <Label className="text-base cursor-pointer text-destructive">Архівний товар</Label>
                                        <p className="text-xs text-muted-foreground">Приховати товар з вітрини магазину.</p>
                                    </div>
                                    <Switch checked={isArchived} onCheckedChange={setIsArchived} disabled={isPending} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="attributes" className="outline-none space-y-6">
                    <Card className="shadow-none border-border/50 w-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Характеристики одягу (Опціонально)</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Колір</Label>
                                <Select value={color} onValueChange={setColor} disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Оберіть колір" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BLACK">Чорний</SelectItem>
                                        <SelectItem value="WHITE">Білий</SelectItem>
                                        <SelectItem value="GREEN">Зелений</SelectItem>
                                        <SelectItem value="YELLOW">Жовтий</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Тип одягу</Label>
                                <Select value={apparelType} onValueChange={setApparelType} disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Оберіть тип одягу" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="T_SHIRT">Футболки</SelectItem>
                                        <SelectItem value="HOODIE">Толстовки й худі</SelectItem>
                                        <SelectItem value="CAP">Кепки</SelectItem>
                                        <SelectItem value="SCARF">Шарфи</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Сезон (Рік)</Label>
                                <Input
                                    value={seasonYear}
                                    onChange={(e) => setSeasonYear(e.target.value)}
                                    disabled={isPending}
                                    placeholder="напр. 2025/2026"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Тип матчу</Label>
                                <Input
                                    value={matchType}
                                    onChange={(e) => setMatchType(e.target.value)}
                                    disabled={isPending}
                                    placeholder="напр. Домашня, Виїзна"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-none border-border/50 w-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Прив&apos;язка до гравців</CardTitle>
                            <CardDescription>
                                Відмітьте гравців, щоб цей товар показувався на їхній сторінці.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-64 pr-4 rounded-md border p-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                    {players.map((player) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded border border-transparent hover:border-border transition-colors"
                                        >
                                            <Checkbox
                                                id={`player-${player.id}`}
                                                checked={selectedPlayers.includes(player.id)}
                                                onCheckedChange={() => togglePlayer(player.id)}
                                                disabled={isPending}
                                            />
                                            <Label htmlFor={`player-${player.id}`} className="flex-1 cursor-pointer">
                                                {player.number ? `${player.number}. ` : ""}
                                                {player.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="variants" className="outline-none">
                    <Card className="shadow-none border-border/50 w-full">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                            <div>
                                <CardTitle className="text-lg">Розмірна сітка та Склад</CardTitle>
                                <CardDescription>Додайте всі доступні розміри та їх залишок.</CardDescription>
                            </div>
                            <Button
                                type="button"
                                onClick={addVariant}
                                variant="secondary"
                                size="sm"
                                disabled={isPending}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Додати розмір
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {state?.errors?.variants && (
                                <p className="text-red-500 text-sm mb-4">{state.errors.variants[0]}</p>
                            )}
                            <div className="space-y-3">
                                {variants.map((variant, idx) => (
                                    <div
                                        key={variant.id}
                                        className="flex flex-col sm:flex-row gap-4 items-end sm:items-center p-4 border rounded-lg bg-muted/10 relative"
                                    >
                                        <div className="space-y-1 w-full sm:w-1/3">
                                            <Label>
                                                Розмір <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={variant.size}
                                                onValueChange={(val) => updateVariant(idx, "size", val)}
                                                disabled={isPending}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Оберіть розмір" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STANDARD_SIZES.map((sz) => {
                                                        const isAlreadySelected = variants.some(
                                                            (v, i) => v.size === sz && i !== idx
                                                        )
                                                        return (
                                                            <SelectItem key={sz} value={sz} disabled={isAlreadySelected}>
                                                                {sz}
                                                            </SelectItem>
                                                        )
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1 w-full sm:w-1/3">
                                            <Label>
                                                Залишок (шт.) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={variant.stock}
                                                onChange={(e) => updateVariant(idx, "stock", Number(e.target.value))}
                                                disabled={isPending}
                                            />
                                        </div>
                                        <div className="space-y-1 w-full sm:w-1/3">
                                            <Label>Артикул / SKU (Опц.)</Label>
                                            <Input
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                                                placeholder="FC-TS-M-01"
                                                disabled={isPending}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-destructive hover:bg-destructive/10 sm:mb-0.5 shrink-0"
                                            size="icon"
                                            onClick={() => removeVariant(idx)}
                                            disabled={isPending || variants.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="media" className="outline-none">
                    <Card className="shadow-none border-border/50 w-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Фотографії товару</CardTitle>
                            <CardDescription>
                                Завантажте зображення (макс. 5 шт). Перше фото буде використано як обкладинка.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mediaUrls.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {mediaUrls.map((url, idx) => (
                                        <div
                                            key={idx}
                                            className="relative group rounded-md overflow-hidden aspect-square border-2 border-border/50 hover:border-border transition-all"
                                        >
                                            <Image
                                                src={url}
                                                alt={`Product media ${idx}`}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            {idx === 0 && (
                                                <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
                                                    Обкладинка
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={() => removeImage(url)}
                                                    className="h-7 w-7 opacity-90 hover:opacity-100 shadow-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {mediaUrls.length < 5 && (
                                <UploadDropzone
                                    endpoint="productImage"
                                    onClientUploadComplete={(res) => {
                                        if (res) {
                                            const newUrls = res.map((file) => file.ufsUrl || file.url)
                                            setMediaUrls((prev) => [...prev, ...newUrls].slice(0, 5))
                                            toast.success("Зображення завантажено")
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(`Помилка: ${error.message}`)
                                    }}
                                    content={{
                                        label: "Перетягніть фотографії сюди",
                                        allowedContent: "Зображення до 8MB (макс. 5 шт)",
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        button: (state: any) => {
                                            if (state.isUploading) return "Завантаження..."
                                            if (state.files && state.files.length > 0) return `Завантажити (${state.files.length})`
                                            if (state.ready) return "Обрати файли"
                                            return "Підготовка..."
                                        },
                                    }}
                                    appearance={{
                                        container:
                                            "border-2 border-dashed border-emerald-500/40 hover:border-emerald-600 transition-all bg-muted/10 py-8 focus-within:ring-0 focus-within:ring-offset-0",
                                        label: "text-emerald-600 hover:text-emerald-700 font-semibold text-base mt-4",
                                        allowedContent: "text-muted-foreground text-xs mt-1",
                                        button:
                                            "bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 mt-4 ut-uploading:cursor-not-allowed",
                                        uploadIcon: "w-10 h-10 text-emerald-600",
                                    }}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <div className="flex flex-col sm:flex-row gap-4 justify-end border-t pt-6 mt-6 w-full">
                <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={isPending}
                    className="w-full sm:w-32"
                >
                    <Link href="/admin/shop/products">Скасувати</Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Оновлення...
                        </>
                    ) : (
                        "Оновити товар"
                    )}
                </Button>
            </div>
        </form>
    )
}