"use client"

import { useState, useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { Link, useRouter } from "@/i18n/navigation"
import { updatePost, type BoundPostData } from "@/actions/news"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { UploadDropzone } from "@/lib/uploadthing"
import { getTranslation } from "@/lib/utils/get-translation"
import { PostType, Prisma, TeamContext } from "../../../../../../../../../generated/prisma"
import { postTypeTranslations, teamContextTranslations } from "@/lib/constants"

type PlayerWithTranslations = Prisma.PlayerGetPayload<{ include: { translations: true } }>;
type CoachWithTranslations = Prisma.CoachGetPayload<{ include: { translations: true } }>;
type MatchWithOpponent = Prisma.MatchGetPayload<{ include: { opponent: { include: { translations: true } } } }>;

type PostForEdit = Prisma.PostGetPayload<{
    include: {
        translations: true;
        media: true;
        mentionedPlayers: { select: { id: true } };
        mentionedCoaches: { select: { id: true } };
        relatedMatches: { select: { id: true } };
    }
}>;

interface EditNewsFormProps {
    post: PostForEdit;
    players: PlayerWithTranslations[];
    coaches: CoachWithTranslations[];
    matches: MatchWithOpponent[];
}

export function EditNewsForm({ post, players, coaches, matches }: EditNewsFormProps) {
    const router = useRouter();
    const ukTranslation = getTranslation(post, "uk");
    const enTranslation = post.translations.find(t => t.language === "en");
    const [titleUk, setTitleUk] = useState(ukTranslation?.title || "");
    const [descriptionUk, setDescriptionUk] = useState(ukTranslation?.description || "");
    const [contentUk, setContentUk] = useState(ukTranslation?.content || "");
    const [titleEn, setTitleEn] = useState(enTranslation?.title || "");
    const [descriptionEn, setDescriptionEn] = useState(enTranslation?.description || "");
    const [contentEn, setContentEn] = useState(enTranslation?.content || "");
    const [type, setType] = useState<PostType>(post.type);
    const [teamContext, setTeamContext] = useState<TeamContext>(post.teamContext);
    const [isPublished, setIsPublished] = useState(post.isPublished);
    const [mediaUrls, setMediaUrls] = useState<string[]>(post.media.map(m => m.url));
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>(post.mentionedPlayers.map(p => p.id));
    const [selectedCoaches, setSelectedCoaches] = useState<string[]>(post.mentionedCoaches.map(c => c.id));
    const [selectedMatches, setSelectedMatches] = useState<string[]>(post.relatedMatches.map(m => m.id));

    const boundData: BoundPostData = {
        titleUk, descriptionUk, contentUk,
        titleEn, descriptionEn, contentEn,
        type, teamContext,
        mediaUrls, isPublished,
        selectedPlayers, selectedCoaches, selectedMatches,
    };

    const updatePostWithData = updatePost.bind(null, post.id, boundData);
    const [state, actionFn, isPending] = useActionState(updatePostWithData, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push("/admin/news");
        } else if (state?.message && !state.success) {
            toast.error(state.message);
        }
    }, [state, router]);

    const handleToggle = (id: string, setter: React.Dispatch<React.SetStateAction<string[]>>, forceState?: boolean) => {
        setter(prev => {
            if (forceState === true) return prev.includes(id) ? prev : [...prev, id];
            if (forceState === false) return prev.filter(i => i !== id);
            return prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
        });
    };

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
                            <Label htmlFor="title_uk" className="text-base font-semibold">Заголовок <span className="text-red-500">*</span></Label>
                            <Input
                                id="title_uk"
                                value={titleUk}
                                onChange={(e) => setTitleUk(e.target.value)}
                                placeholder="Введіть заголовок новини..."
                                className="text-lg"
                                disabled={isPending}
                            />
                            {state?.errors?.title_uk && <p className="text-red-500 text-sm">{state.errors.title_uk[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description_uk" className="font-semibold">Короткий опис</Label>
                            <Textarea
                                id="description_uk"
                                value={descriptionUk}
                                onChange={(e) => setDescriptionUk(e.target.value)}
                                placeholder="Текст для прев'ю в картках..."
                                className="resize-none"
                                rows={3}
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label className="text-base font-semibold">Основний текст <span className="text-red-500">*</span></Label>
                            <RichTextEditor value={contentUk} onChange={setContentUk} disabled={isPending} />
                            {state?.errors?.content_uk && <p className="text-red-500 text-sm">{state.errors.content_uk[0]}</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="en" className="space-y-4 outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="title_en" className="text-base font-semibold">Заголовок (Англійською)</Label>
                            <Input
                                id="title_en"
                                value={titleEn}
                                onChange={(e) => setTitleEn(e.target.value)}
                                placeholder="Введіть заголовок англійською..."
                                className="text-lg"
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description_en" className="font-semibold">Короткий опис (Англійською)</Label>
                            <Textarea
                                id="description_en"
                                value={descriptionEn}
                                onChange={(e) => setDescriptionEn(e.target.value)}
                                placeholder="Текст для прев'ю англійською..."
                                className="resize-none"
                                rows={3}
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label className="text-base font-semibold">Основний текст (Англійською)</Label>
                            <RichTextEditor value={contentEn} onChange={setContentEn} disabled={isPending} />
                        </div>
                    </TabsContent>
                </Tabs>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="h-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Медіафайли</CardTitle>
                            <CardDescription>Обкладинка та додаткові фотографії.</CardDescription>
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
                                            {idx === 0 && <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded">Головна</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {mediaUrls.length < 4 && (
                                <UploadDropzone
                                    endpoint="postImage"
                                    onClientUploadComplete={(res) => {
                                        if (res) {
                                            const newUrls = res.map(file => file.ufsUrl || file.url);
                                            setMediaUrls(prev => [...prev, ...newUrls].slice(0, 4));
                                            toast.success("Зображення завантажено");
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(`Помилка: ${error.message}`);
                                    }}
                                    content={{
                                        label: "Перетягніть файли сюди",
                                        allowedContent: "Зображення до 8MB (макс. 4 шт.)",
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        button: (state: any) => {
                                            if (state.isUploading) return "Завантаження...";
                                            if (state.files && state.files.length > 0) {
                                                return `Завантажити (${state.files.length})`;
                                            }
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
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Налаштування</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="publish-toggle" className="cursor-pointer">Опублікувати одразу</Label>
                                <Switch
                                    id="publish-toggle"
                                    checked={isPublished}
                                    onCheckedChange={setIsPublished}
                                    disabled={isPending}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Категорія</Label>
                                <Select value={type} onValueChange={(val) => setType(val as PostType)} disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Оберіть категорію" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(postTypeTranslations).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Команда</Label>
                                <Select value={teamContext} onValueChange={(val) => setTeamContext(val as TeamContext)} disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Оберіть команду" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(teamContextTranslations).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="xl:col-span-1 space-y-6 h-full">
                <Card className="h-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">{"Зв'язки"}</CardTitle>
                        <CardDescription>{"Прив'яжіть новину до профілів для крос-відображення на сайті."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-base">Згадані гравці ({selectedPlayers.length})</Label>
                            <ScrollArea className="h-87.5 rounded-md border p-3 bg-muted/10">
                                <div className="space-y-3">
                                    {players.map(player => {
                                        const translation = getTranslation(player, "uk");
                                        return (
                                            <div key={player.id} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`player-${player.id}`}
                                                    checked={selectedPlayers.includes(player.id)}
                                                    onCheckedChange={(checked) => handleToggle(player.id, setSelectedPlayers, checked === true)}
                                                />
                                                <Label
                                                    htmlFor={`player-${player.id}`}
                                                    className="text-sm font-medium cursor-pointer leading-none flex-1"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleToggle(player.id, setSelectedPlayers);
                                                    }}
                                                >
                                                    {translation?.name || "Без імені"} <span className="text-muted-foreground ml-1">#{player.number}</span>
                                                </Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base">Згадані тренери ({selectedCoaches.length})</Label>
                            <ScrollArea className="h-50 rounded-md border p-3 bg-muted/10">
                                <div className="space-y-3">
                                    {coaches.map(coach => {
                                        const translation = getTranslation(coach, "uk");
                                        return (
                                            <div key={coach.id} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`coach-${coach.id}`}
                                                    checked={selectedCoaches.includes(coach.id)}
                                                    onCheckedChange={(checked) => handleToggle(coach.id, setSelectedCoaches, checked === true)}
                                                />
                                                <Label
                                                    htmlFor={`coach-${coach.id}`}
                                                    className="text-sm font-medium cursor-pointer leading-none flex-1"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleToggle(coach.id, setSelectedCoaches);
                                                    }}
                                                >
                                                    {translation?.name || "Без імені"} <span className="text-muted-foreground ml-1 text-xs">({translation?.role})</span>
                                                </Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base">{"Пов'язані матчі"} ({selectedMatches.length})</Label>
                            <ScrollArea className="h-62.5 rounded-md border p-3 bg-muted/10">
                                <div className="space-y-3">
                                    {matches.map(match => {
                                        const opponentName = getTranslation(match.opponent, "uk")?.name || "Суперник";
                                        const matchDate = new Date(match.date).toLocaleDateString("uk-UA");
                                        return (
                                            <div key={match.id} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`match-${match.id}`}
                                                    checked={selectedMatches.includes(match.id)}
                                                    onCheckedChange={(checked) => handleToggle(match.id, setSelectedMatches, checked === true)}
                                                />
                                                <Label
                                                    htmlFor={`match-${match.id}`}
                                                    className="text-sm font-medium cursor-pointer leading-none flex-1"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleToggle(match.id, setSelectedMatches);
                                                    }}
                                                >
                                                    vs {opponentName} <span className="text-muted-foreground ml-1 text-xs">({matchDate})</span>
                                                </Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6 mt-4">
                <Button type="button" variant="outline" asChild disabled={isPending} className="w-full sm:w-32">
                    <Link href="/admin/news">
                        Скасувати
                    </Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending}>
                    {isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Оновлення...</>
                    ) : "Оновити публікацію"}
                </Button>
            </div>
        </form>
    )
}