"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import Flag from "react-world-flags"
import { Loader2, Trash2 } from "lucide-react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { BoundPlayerData, updatePlayer } from "@/actions/team"
import { PlayerPosition, TeamContext, Prisma } from "../../../../../../../../../../generated/prisma"
import { COUNTRIES, teamContextTranslations } from "@/lib/constants"
import { UploadDropzone } from "@/lib/uploadthing"
import { getTranslation } from "@/lib/utils/get-translation"

type PlayerWithRelations = Prisma.PlayerGetPayload<{
    include: { translations: true; media: true }
}>

const positionTranslations: Record<PlayerPosition, string> = {
    GOALKEEPER: "Воротар",
    DEFENDER: "Захисник",
    MIDFIELDER: "Півзахисник",
    FORWARD: "Нападник",
};

export function EditPlayerForm({ player }: { player: PlayerWithRelations }) {
    const router = useRouter();
    const txUk = getTranslation(player, "uk");
    const txEn = player.translations.find(t => t.language === "en");
    const formattedBirthDate = player.birthDate
        ? new Date(player.birthDate).toISOString().split("T")[0]
        : "";
    const [nameUk, setNameUk] = useState(txUk?.name || "");
    const [bioUk, setBioUk] = useState(txUk?.bio || "");
    const [nameEn, setNameEn] = useState(txEn?.name || "");
    const [bioEn, setBioEn] = useState(txEn?.bio || "");
    const [number, setNumber] = useState<number | "">(player.number);
    const [position, setPosition] = useState<PlayerPosition>(player.position);
    const [teamContext, setTeamContext] = useState<TeamContext>(player.teamContext);
    const [nationality, setNationality] = useState<string>(player.nationality || "UKR");
    const [height, setHeight] = useState<number | "">(player.height || "");
    const [weight, setWeight] = useState<number | "">(player.weight || "");
    const [birthDate, setBirthDate] = useState<string>(formattedBirthDate);
    const [avatarUrl, setAvatarUrl] = useState(player.avatar || "");
    const [isManualAvatar, setIsManualAvatar] = useState(player.isManualAvatar);
    const [mediaUrls, setMediaUrls] = useState<string[]>(player.media.map(m => m.url));
    const [initialMatches, setInitialMatches] = useState<number>(player.initialMatches);
    const [initialGoals, setInitialGoals] = useState<number>(player.initialGoals);
    const [initialAssists, setInitialAssists] = useState<number>(player.initialAssists);
    const [initialCleanSheets, setInitialCleanSheets] = useState<number>(player.initialCleanSheets);
    const [initialGoalsConceded, setInitialGoalsConceded] = useState<number>(player.initialGoalsConceded);
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
    const updatePlayerWithId = updatePlayer.bind(null, player.id, boundData);
    const [state, actionFn, isPending] = useActionState(updatePlayerWithId, undefined);

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
                                placeholder="Олександр Назаренко"
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
                                placeholder="Oleksandr Nazarenko"
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
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Аватар профілю</CardTitle>
                            <CardDescription>Завантажте кастомне фото гравця.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
                            {avatarUrl ? (
                                <div className="mt-4 relative group rounded-md overflow-hidden border aspect-3/4 bg-muted w-32 mx-auto transition-all hover:border-emerald-500/50">
                                    <Image
                                        src={avatarUrl}
                                        alt="Avatar preview"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            onClick={() => setAvatarUrl("")}
                                            className="h-8 w-8 opacity-90 hover:opacity-100 shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <UploadDropzone
                                    endpoint="teamMemberImage"
                                    onClientUploadComplete={(res) => {
                                        if (res && res.length > 0) {
                                            setAvatarUrl(res[0].ufsUrl || res[0].url);
                                            setIsManualAvatar(true);
                                            toast.success("Аватар успішно завантажено");
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(`Помилка: ${error.message}`);
                                    }}
                                    content={{
                                        label: "Перетягніть фото сюди",
                                        allowedContent: "Зображення до 4MB (1 шт.)",
                                        button: (state: { isUploading: boolean; ready: boolean; files: unknown[] }) => {
                                            if (state.isUploading) return "Завантаження...";
                                            if (state.files && state.files.length > 0) return "Завантажити";
                                            if (state.ready) return "Обрати файл";
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
                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
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
                                        <div key={idx} className="relative group rounded-md overflow-hidden aspect-video border-2 border-border/50 hover:border-border transition-all">
                                            <Image src={url} alt={`Media ${idx}`} fill className="object-cover" unoptimized />
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
                            {mediaUrls.length < 10 && (
                                <UploadDropzone
                                    endpoint="teamMemberImage"
                                    onClientUploadComplete={(res) => {
                                        if (res) {
                                            const newUrls = res.map(file => file.ufsUrl || file.url);
                                            setMediaUrls(prev => [...prev, ...newUrls].slice(0, 10));
                                            toast.success("Зображення завантажено");
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(`Помилка: ${error.message}`);
                                    }}
                                    content={{
                                        label: "Перетягніть фотографії сюди",
                                        allowedContent: "Зображення до 4MB",
                                        button: (state: { isUploading: boolean; ready: boolean; files: unknown[] }) => {
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
                                <Label htmlFor="number">Номер *</Label>
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
                                <Label>Позиція *</Label>
                                <Select value={position} onValueChange={(val) => setPosition(val as PlayerPosition)} disabled={isPending}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(positionTranslations).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Команда *</Label>
                            <Select value={teamContext} onValueChange={(val) => setTeamContext(val as TeamContext)} disabled={isPending}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
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
                                <SelectTrigger><SelectValue placeholder="Оберіть країну" /></SelectTrigger>
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
                        <CardDescription>{isGoalkeeper ? "Поля для воротаря" : "Поля для польового гравця"}</CardDescription>
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
                                        <p className="text-sm text-red-500 font-medium">Сухих матчів не може бути більше, ніж зіграних!</p>
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
                    <Link href="/admin/team/players">Скасувати</Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending || (isGoalkeeper && initialCleanSheets > initialMatches)}>
                    {isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Збереження...</>
                    ) : "Оновити гравця"}
                </Button>
            </div>
        </form>
    );
}