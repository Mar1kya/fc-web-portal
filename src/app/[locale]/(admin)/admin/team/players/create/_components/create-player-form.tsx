"use client"

import { useState, useActionState, useEffect } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import Flag from "react-world-flags"
import { Loader2, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { BoundPlayerData, createPlayer } from "@/actions/team"
import { PlayerPosition, TeamContext } from "../../../../../../../../../generated/prisma"
import { COUNTRIES, teamContextTranslations } from "@/lib/constants"
import { UploadDropzone } from "@/lib/uploadthing"
import { Switch } from "@/components/ui/switch"


const positionTranslations: Record<PlayerPosition, string> = {
    GOALKEEPER: "Воротар",
    DEFENDER: "Захисник",
    MIDFIELDER: "Півзахисник",
    FORWARD: "Нападник",
};

export function CreatePlayerForm() {
    const router = useRouter();
    const [nameUk, setNameUk] = useState("");
    const [bioUk, setBioUk] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [bioEn, setBioEn] = useState("");
    const [number, setNumber] = useState<number | "">("");
    const [position, setPosition] = useState<PlayerPosition>(PlayerPosition.MIDFIELDER);
    const [teamContext, setTeamContext] = useState<TeamContext>(TeamContext.MAIN_TEAM);
    const [nationality, setNationality] = useState<string>("UKR");
    const [height, setHeight] = useState<number | "">("");
    const [weight, setWeight] = useState<number | "">("");
    const [birthDate, setBirthDate] = useState<string>("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isManualAvatar, setIsManualAvatar] = useState(false);
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [initialMatches, setInitialMatches] = useState<number>(0);
    const [initialGoals, setInitialGoals] = useState<number>(0);
    const [initialAssists, setInitialAssists] = useState<number>(0);
    const [initialCleanSheets, setInitialCleanSheets] = useState<number>(0);
    const [initialGoalsConceded, setInitialGoalsConceded] = useState<number>(0);
    const isGoalkeeper = position === PlayerPosition.GOALKEEPER;

    const boundData: BoundPlayerData = {
        name_uk: nameUk,
        bio_uk: bioUk,
        name_en: nameEn,
        bio_en: bioEn,
        number: Number(number) || 0,
        position,
        teamContext,
        nationality,
        height: height === "" ? undefined : Number(height),
        weight: weight === "" ? undefined : Number(weight),
        birthDate: birthDate ? new Date(birthDate) : undefined,
        avatarUrl,
        isManualAvatar, 
        mediaUrls,
        initialMatches,
        initialGoals,
        initialAssists,
        initialCleanSheets,
        initialGoalsConceded,
    };

    const createPlayerWithData = createPlayer.bind(null, boundData);
    const [state, actionFn, isPending] = useActionState(createPlayerWithData, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push("/admin/team/players");
            router.refresh();
        } else if (state?.message && !state.success) {
            toast.error(state.message);
        }
    }, [state, router]);

    const removeImage = (urlToRemove: string) => {
        setMediaUrls(prev => prev.filter(url => url !== urlToRemove));
    };

    return (
        <form action={actionFn} className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 space-y-6 flex flex-col">
                <Tabs defaultValue="uk" className="w-full border rounded-lg bg-card p-4 sm:p-6 shadow-sm">
                    <TabsList className="grid w-full grid-cols-2 max-w-100 mb-6">
                        <TabsTrigger value="uk">Українська версія</TabsTrigger>
                        <TabsTrigger value="en">Англійська (Опціонально)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="uk" className="space-y-4 outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="name_uk" className="text-base font-semibold">Ім&apos;я та Прізвище <span className="text-red-500">*</span></Label>
                            <Input
                                id="name_uk"
                                value={nameUk}
                                onChange={(e) => setNameUk(e.target.value)}
                                className="text-lg"
                                disabled={isPending}
                            />
                            {state?.errors?.name_uk && <p className="text-red-500 text-sm">{state.errors.name_uk[0]}</p>}
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label className="text-base font-semibold">Біографія</Label>
                            <RichTextEditor value={bioUk} onChange={setBioUk} disabled={isPending} />
                        </div>
                    </TabsContent>
                    <TabsContent value="en" className="space-y-4 outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="name_en" className="text-base font-semibold">Ім&apos;я та Прізвище (Англійська)</Label>
                            <Input
                                id="name_en"
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                className="text-lg"
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label className="text-base font-semibold">Біографія (Англійська)</Label>
                            <RichTextEditor value={bioEn} onChange={setBioEn} disabled={isPending} />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="h-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Аватар профілю</CardTitle>
                            <CardDescription>Вставте посилання на фото або залиште порожнім (підтягнеться з SofaScore).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="avatarUrl">URL фотографії</Label>
                                <Input
                                    id="avatarUrl"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    placeholder="https://..."
                                    disabled={isPending}
                                />
                            </div>

                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-2">
                                <div className="space-y-0.5">
                                    <Label htmlFor="manual-avatar" className="text-sm font-medium">
                                        Кастомне фото
                                    </Label>
                                    <p className="text-[12px] text-muted-foreground leading-tight">
                                        Заборонити SofaScore оновлювати
                                    </p>
                                </div>
                                <Switch
                                    id="manual-avatar"
                                    checked={isManualAvatar}
                                    onCheckedChange={setIsManualAvatar}
                                    disabled={isPending}
                                />
                            </div>
                            {avatarUrl && (
                                <div className="mt-4 relative group rounded-md overflow-hidden border aspect-3/4 bg-muted w-32 mx-auto">
                                    <Image src={avatarUrl} alt="Avatar preview" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setAvatarUrl("")}
                                        className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Медіафайли</CardTitle>
                            <CardDescription>Додаткові фото гравця (макс. 10 шт).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mediaUrls.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {mediaUrls.map((url, idx) => (
                                        <div key={idx} className="relative group rounded-md overflow-hidden border aspect-video bg-muted">
                                            <Image src={url} alt={`Media ${idx}`} fill className="object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(url)}
                                                className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {mediaUrls.length < 10 && (
                                <UploadDropzone
                                    endpoint="teamMemberImage"
                                    onClientUploadComplete={(res) => {
                                        if (res) {
                                            const newUrls = res.map(file => file.ufsUrl || file.url);
                                            setMediaUrls(prev => [...prev, ...newUrls].slice(0, 3));
                                            toast.success("Зображення завантажено");
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(`Помилка: ${error.message}`);
                                    }}
                                    content={{
                                        label: "Перетягніть фотографії сюди",
                                        allowedContent: "Зображення до 4MB",
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        button: (state: any) => {
                                            if (state.isUploading) return "Завантаження...";
                                            if (state.files && state.files.length > 0) return `Завантажити (${state.files.length})`;
                                            if (state.ready) return "Обрати файли";
                                            return "Підготовка...";
                                        },
                                    }}
                                    appearance={{
                                        container: "border-2 border-dashed border-emerald-500/40 hover:border-emerald-600 transition-all bg-muted/10 py-8 focus-within:ring-0 focus-within:ring-offset-0",
                                        label: "text-emerald-600 hover:text-emerald-700 font-semibold text-base mt-4",
                                        allowedContent: "text-muted-foreground text-xs mt-1",
                                        button: "bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 mt-4 ut-uploading:cursor-not-allowed",
                                        uploadIcon: "w-10 h-10 text-emerald-600",
                                    }}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="xl:col-span-1 space-y-6 h-full flex flex-col">
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Спортивні дані</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="number">Номер <span className="text-red-500">*</span></Label>
                                <Input
                                    id="number"
                                    type="number"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value ? Number(e.target.value) : "")}
                                    disabled={isPending}
                                />
                                {state?.errors?.number && <p className="text-red-500 text-sm">{state.errors.number[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Позиція <span className="text-red-500">*</span></Label>
                                <Select value={position} onValueChange={(val) => setPosition(val as PlayerPosition)} disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(positionTranslations).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Команда <span className="text-red-500">*</span></Label>
                            <Select value={teamContext} onValueChange={(val) => setTeamContext(val as TeamContext)} disabled={isPending}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(teamContextTranslations).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Національність</Label>
                            <Select value={nationality} onValueChange={setNationality} disabled={isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Оберіть країну" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-60">
                                        {COUNTRIES.map((country) => (
                                            <SelectItem key={country.code} value={country.code}>
                                                <div className="flex items-center gap-2">
                                                    <Flag code={country.code} className="h-3 w-4 rounded-sm object-cover" />
                                                    <span>{country.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        </div>
                       <div className="space-y-2">
                            <Label htmlFor="birthDate">Дата народження</Label>
                            <Input
                                id="birthDate"
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                disabled={isPending}
                                max={new Date().toISOString().split("T")[0]} 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="height">Зріст (см)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : "")}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Вага (кг)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : "")}
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="flex-1">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Початкова статистика</CardTitle>
                        <CardDescription>
                            {isGoalkeeper ? "Поля для воротаря" : "Поля для польового гравця"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="initialMatches">Зіграні матчі</Label>
                            <Input
                                id="initialMatches"
                                type="number"
                                min={0}
                                value={initialMatches}
                                onChange={(e) => setInitialMatches(Number(e.target.value) || 0)}
                                disabled={isPending}
                            />
                        </div>

                        {isGoalkeeper ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="initialCleanSheets">Сухі матчі</Label>
                                    <Input
                                        id="initialCleanSheets"
                                        type="number"
                                        min={0}
                                        value={initialCleanSheets}
                                        onChange={(e) => setInitialCleanSheets(Number(e.target.value) || 0)}
                                        disabled={isPending}
                                        className={initialCleanSheets > initialMatches ? "border-red-500 focus-visible:ring-red-500" : ""}
                                    />
                                    {initialCleanSheets > initialMatches && (
                                        <p className="text-sm text-red-500 font-medium">
                                            Сухих матчів не може бути більше, ніж зіграних!
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="initialGoalsConceded">Пропущені голи</Label>
                                    <Input
                                        id="initialGoalsConceded"
                                        type="number"
                                        min={0}
                                        value={initialGoalsConceded}
                                        onChange={(e) => setInitialGoalsConceded(Number(e.target.value) || 0)}
                                        disabled={isPending}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="initialGoals">Забиті голи</Label>
                                    <Input
                                        id="initialGoals"
                                        type="number"
                                        min={0}
                                        value={initialGoals}
                                        onChange={(e) => setInitialGoals(Number(e.target.value) || 0)}
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="initialAssists">Асисти</Label>
                                    <Input
                                        id="initialAssists"
                                        type="number"
                                        min={0}
                                        value={initialAssists}
                                        onChange={(e) => setInitialAssists(Number(e.target.value) || 0)}
                                        disabled={isPending}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6 mt-4">
                <Button type="button" variant="outline" asChild disabled={isPending} className="w-full sm:w-32">
                    <Link href="/admin/team/players">
                        Скасувати
                    </Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending}>
                    {isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Збереження...</>
                    ) : "Додати гравця"}
                </Button>
            </div>
        </form>
    );
}