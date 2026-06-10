"use client"

import { useState, useActionState, useEffect } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { Loader2, Star, Trash2, ImageIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadDropzone } from "@/lib/uploadthing"
import { Badge } from "@/components/ui/badge"
import { updateGallery, BoundGalleryData } from "@/actions/gallery"
import { Gallery, GalleryTranslation, Media } from "../../../../../../../../../generated/prisma"

type MatchOption = { id: string; label: string };

type EditGalleryFormProps = {
    gallery: Gallery & { translations: GalleryTranslation[]; media: Media[] };
    matches: MatchOption[];
};

export function EditGalleryForm({ gallery, matches }: EditGalleryFormProps) {
    const router = useRouter();
    const initialTitleUk = gallery.translations.find(t => t.language === "uk")?.title || "";
    const initialTitleEn = gallery.translations.find(t => t.language === "en")?.title || "";
    const initialDate = gallery.publishedAt
        ? new Date(new Date(gallery.publishedAt).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
        : "";
    const [titleUk, setTitleUk] = useState(initialTitleUk);
    const [titleEn, setTitleEn] = useState(initialTitleEn);
    const [matchId, setMatchId] = useState<string>(gallery.matchId || "none");
    const [publishedAt, setPublishedAt] = useState<string>(initialDate);
    const [mediaUrls, setMediaUrls] = useState<string[]>(gallery.media.map(m => m.url));
    const [coverUrl, setCoverUrl] = useState<string>(gallery.coverUrl);

    const boundData: BoundGalleryData = {
        title_uk: titleUk,
        title_en: titleEn,
        coverUrl,
        mediaUrls,
        matchId: matchId === "none" ? undefined : matchId,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    };

    const updateGalleryWithData = updateGallery.bind(null, gallery.id, boundData);
    const [state, actionFn, isPending] = useActionState(updateGalleryWithData, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push("/admin/gallery");
            router.refresh();
        } else if (state?.message && !state?.success) {
            toast.error(state.message);
        }
    }, [state, router]);

    const removeImage = (urlToRemove: string) => {
        setMediaUrls(prev => {
            const newUrls = prev.filter(url => url !== urlToRemove);
            if (coverUrl === urlToRemove) {
                setCoverUrl(newUrls.length > 0 ? newUrls[0] : "");
            }
            return newUrls;
        });
    };

    return (
        <form action={actionFn} className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-1 space-y-6 flex flex-col h-full">
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Назва галереї</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="uk" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="uk">Українська</TabsTrigger>
                                <TabsTrigger value="en">Англійська</TabsTrigger>
                            </TabsList>
                            <TabsContent value="uk" className="space-y-2 mt-0 outline-none">
                                <Label htmlFor="title_uk">Назва <span className="text-red-500">*</span></Label>
                                <Input id="title_uk" value={titleUk} onChange={(e) => setTitleUk(e.target.value)} disabled={isPending} />
                                {state?.errors?.title_uk && <p className="text-red-500 text-sm">{state.errors.title_uk[0]}</p>}
                            </TabsContent>
                            <TabsContent value="en" className="space-y-2 mt-0 outline-none">
                                <Label htmlFor="title_en">Назва (Англійською)</Label>
                                <Input id="title_en" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} disabled={isPending} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                <Card className="flex-1">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Деталі</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Прив&apos;язка до матчу (Опціонально)</Label>
                            <Select value={matchId} onValueChange={setMatchId} disabled={isPending}>
                                <SelectTrigger><SelectValue placeholder="Оберіть матч" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Без прив&apos;язки</SelectItem>
                                    {matches.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Дата публікації</Label>
                            <Input
                                type="datetime-local"
                                value={publishedAt}
                                onChange={(e) => setPublishedAt(e.target.value)}
                                disabled={isPending}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="xl:col-span-2 space-y-6 flex flex-col h-full">
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Медіафайли ({mediaUrls.length}/50)</CardTitle>
                            <CardDescription>Завантажте фото. Наведіть на фото, щоб зробити його обкладинкою.</CardDescription>
                        </div>
                        {state?.errors?.mediaUrls && <span className="text-red-500 text-sm font-medium">{state.errors.mediaUrls[0]}</span>}
                        {state?.errors?.coverUrl && <span className="text-red-500 text-sm font-medium">{state.errors.coverUrl[0]}</span>}
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                        {mediaUrls.length < 50 && (
                            <UploadDropzone
                                endpoint="galleryImages"
                                onClientUploadComplete={(res) => {
                                    if (res && res.length > 0) {
                                        const newUrls = res.map(file => file.ufsUrl || file.url);
                                        setMediaUrls(prev => {
                                            const updated = [...prev, ...newUrls].slice(0, 50);
                                            if (!coverUrl && updated.length > 0) {
                                                setCoverUrl(updated[0]);
                                            }
                                            return updated;
                                        });
                                        toast.success(`Завантажено файлів: ${res.length}`);
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    toast.error(`Помилка: ${error.message}`);
                                }}
                                appearance={{
                                    container: "border-2 border-dashed border-emerald-500/40 hover:border-emerald-600 bg-muted/10 py-4 transition-all focus-within:ring-0",
                                    label: "text-emerald-600 font-medium text-sm mt-2 hover:text-emerald-700",
                                    allowedContent: "text-muted-foreground text-xs mt-1",
                                    button: "bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 mt-3 h-8",
                                    uploadIcon: "w-6 h-6 text-emerald-600",
                                }}
                                content={{
                                    label: "Перетягніть фото сюди (макс. 50 шт)",
                                    allowedContent: "Зображення до 8MB",
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    button: (state: any) => {
                                        if (state.isUploading) return "Завантаження...";
                                        if (state.files && state.files.length > 0) return `Завантажити (${state.files.length})`;
                                        return "Обрати файли";
                                    },
                                }}
                            />
                        )}
                        {mediaUrls.length > 0 ? (
                            <div style={{ height: '400px', overflowY: 'auto' }} className="w-full border rounded-lg bg-muted/5 p-4 shadow-inner pr-2">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {mediaUrls.map((url, idx) => {
                                        const isCover = coverUrl === url;
                                        return (
                                            <div key={idx} className={`relative group rounded-md overflow-hidden aspect-video border-2 transition-all ${isCover ? 'border-emerald-500 shadow-md scale-[1.02]' : 'border-border/50 hover:border-border'}`}>
                                                <Image src={url} alt={`Gallery media ${idx}`} fill className="object-cover" unoptimized />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    {!isCover && (
                                                        <Button type="button" size="sm" variant="secondary" onClick={() => setCoverUrl(url)} className="h-7 text-[10px] px-2 bg-black/70 hover:bg-emerald-500 hover:text-white text-white border-0 backdrop-blur-sm shadow-sm">
                                                            <Star className="w-3 h-3 mr-1" /> На обкладиннику
                                                        </Button>
                                                    )}
                                                    <Button type="button" size="icon" variant="destructive" onClick={() => removeImage(url)} className="h-7 w-7 opacity-90 hover:opacity-100 shadow-sm">
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                {isCover && (
                                                    <Badge className="absolute top-1 left-1 pointer-events-none bg-emerald-500 hover:bg-emerald-500 text-[9px] px-1.5 py-0 h-4 border-none text-white shadow-sm">
                                                        Обкладинка
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '400px' }} className="w-full border border-dashed rounded-lg bg-muted/10 flex flex-col items-center justify-center text-muted-foreground py-4">
                                <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Галерея порожня</p>
                                <p className="text-xs opacity-70">Завантажте фотографії за допомогою форми вище</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6">
                <Button type="button" variant="outline" asChild disabled={isPending} className="w-full sm:w-32">
                    <Link href="/admin/gallery">Скасувати</Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending}>
                    {isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Збереження...</>
                    ) : "Зберегти зміни"}
                </Button>
            </div>
        </form>
    );
}