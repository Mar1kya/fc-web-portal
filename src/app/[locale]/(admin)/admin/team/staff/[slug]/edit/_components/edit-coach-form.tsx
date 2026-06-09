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
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { BoundCoachData, updateCoach } from "@/actions/team"
import { TeamContext, Prisma } from "../../../../../../../../../../generated/prisma"
import { COUNTRIES, teamContextTranslations } from "@/lib/constants"
import { UploadDropzone } from "@/lib/uploadthing"

type CoachWithRelations = Prisma.CoachGetPayload<{
    include: { translations: true; media: true }
}>

export function EditCoachForm({ coach }: { coach: CoachWithRelations }) {
    const router = useRouter();
    const txUk = coach.translations.find(t => t.language === "uk");
    const txEn = coach.translations.find(t => t.language === "en");
    const formattedBirthDate = coach.birthDate
        ? new Date(coach.birthDate).toISOString().split("T")[0]
        : "";
    const [nameUk, setNameUk] = useState(txUk?.name || "");
    const [roleUk, setRoleUk] = useState(txUk?.role || "");
    const [bioUk, setBioUk] = useState(txUk?.bio || "");

    const [nameEn, setNameEn] = useState(txEn?.name || "");
    const [roleEn, setRoleEn] = useState(txEn?.role || "");
    const [bioEn, setBioEn] = useState(txEn?.bio || "");
    const [teamContext, setTeamContext] = useState<TeamContext>(coach.teamContext);
    const [nationality, setNationality] = useState<string>(coach.nationality || "UKR");
    const [birthDate, setBirthDate] = useState<string>(formattedBirthDate);
    const [avatarUrl, setAvatarUrl] = useState(coach.avatar || "");
    const [mediaUrls, setMediaUrls] = useState<string[]>(coach.media.map(m => m.url));

    const boundData: BoundCoachData = {
        name_uk: nameUk,
        role_uk: roleUk,
        bio_uk: bioUk,
        name_en: nameEn,
        role_en: roleEn,
        bio_en: bioEn,
        teamContext,
        nationality,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        avatarUrl,
        mediaUrls,
    };

    const updateCoachWithId = updateCoach.bind(null, coach.id, boundData);
    const [state, actionFn, isPending] = useActionState(updateCoachWithId, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push("/admin/team/staff");
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="space-y-2">
                                <Label htmlFor="role_uk" className="text-base font-semibold">Посада <span className="text-red-500">*</span></Label>
                                <Input
                                    id="role_uk"
                                    value={roleUk}
                                    onChange={(e) => setRoleUk(e.target.value)}
                                    className="text-lg"
                                    disabled={isPending}
                                />
                                {state?.errors?.role_uk && <p className="text-red-500 text-sm">{state.errors.role_uk[0]}</p>}
                            </div>
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label className="text-base font-semibold">Біографія</Label>
                            <RichTextEditor value={bioUk} onChange={setBioUk} disabled={isPending} />
                        </div>
                    </TabsContent>
                    <TabsContent value="en" className="space-y-4 outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="space-y-2">
                                <Label htmlFor="role_en" className="text-base font-semibold">Посада (Англійська)</Label>
                                <Input
                                    id="role_en"
                                    value={roleEn}
                                    onChange={(e) => setRoleEn(e.target.value)}
                                    className="text-lg"
                                    disabled={isPending}
                                />
                            </div>
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
                            <CardDescription>Завантажте головне фото тренера.</CardDescription>
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
                        </CardContent>
                    </Card>
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Медіафайли</CardTitle>
                            <CardDescription>Додаткові фото (макс. 3 шт).</CardDescription>
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
                            {mediaUrls.length < 3 && (
                                <UploadDropzone
                                    endpoint="galleryImages"
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
                                        allowedContent: "Зображення до 8MB",
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
                        <CardTitle className="text-lg">Дані співробітника</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                </Card>
            </div>
            <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6 mt-4">
                <Button type="button" variant="outline" asChild disabled={isPending} className="w-full sm:w-32">
                    <Link href="/admin/team/staff">
                        Скасувати
                    </Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending}>
                    {isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Оновлення...</>
                    ) : "Оновити тренера"}
                </Button>
            </div>
        </form>
    );
}