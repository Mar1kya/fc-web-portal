"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BoundTournamentData, updateTournament } from "@/actions/tournament"
import { TournamentWithRelations } from "../../../_components/columns"

interface EditTournamentFormProps {
    tournament: TournamentWithRelations;
}

export function EditTournamentForm({ tournament }: EditTournamentFormProps) {
    const router = useRouter();
    const txUk = tournament.translations.find(t => t.language === "uk");
    const txEn = tournament.translations.find(t => t.language === "en");
    const [nameUk, setNameUk] = useState(txUk?.name || "");
    const [nameEn, setNameEn] = useState(txEn?.name || "");
    const [sofascoreId, setSofascoreId] = useState(
        tournament.sofascoreId != null ? tournament.sofascoreId.toString() : ""
    );
    const [hasStandings, setHasStandings] = useState(tournament.hasStandings);

    const boundData: BoundTournamentData = {
        name_uk: nameUk,
        name_en: nameEn,
        sofascoreId: sofascoreId ? Number(sofascoreId) : null,
        hasStandings,
    };

    const updateTournamentWithId = updateTournament.bind(null, tournament.id, boundData);
    const [state, actionFn, isPending] = useActionState(updateTournamentWithId, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push("/admin/tournaments/competitions");
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
                        <TabsTrigger value="en">Англійська версія</TabsTrigger>
                    </TabsList>
                    <TabsContent value="uk" className="space-y-4 outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="name_uk" className="text-base font-semibold">
                                Назва турніру <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name_uk"
                                placeholder="Наприклад: Українська Прем'єр-Ліга"
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
                            <Label htmlFor="name_en" className="text-base font-semibold">
                                Назва турніру (Англійська) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name_en"
                                placeholder="Наприклад: Ukrainian Premier League"
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                className="text-lg"
                                disabled={isPending}
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                Якщо ви зміните англійську назву, URL-адреса (slug) турніру на сайті також зміниться.
                            </p>
                            {state?.errors?.name_en && <p className="text-red-500 text-sm">{state.errors.name_en[0]}</p>}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <div className="xl:col-span-1 space-y-6 h-full flex flex-col">
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Налаштування даних</CardTitle>
                        <CardDescription>Технічні параметри турніру</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="sofascoreId">SofaScore ID (Опціонально)</Label>
                            <Input
                                id="sofascoreId"
                                type="number"
                                placeholder="Наприклад: 325"
                                value={sofascoreId}
                                onChange={(e) => setSofascoreId(e.target.value)}
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Вкажіть ID турніру на SofaScore, якщо для нього потрібно завантажувати турнірну таблицю через крон.
                            </p>
                            {state?.errors?.sofascoreId && <p className="text-red-500 text-sm">{state.errors.sofascoreId[0]}</p>}
                        </div>
                        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Турнірна таблиця</Label>
                                <p className="text-[12px] text-muted-foreground leading-tight">
                                    Увімкніть, якщо турнір має таблицю очок (наприклад, УПЛ).
                                </p>
                            </div>
                            <Switch 
                                checked={hasStandings} 
                                onCheckedChange={setHasStandings} 
                                disabled={isPending}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6 mt-4">
                <Button type="button" variant="outline" asChild disabled={isPending} className="w-full sm:w-32">
                    <Link href="/admin/tournaments/competitions">
                        Скасувати
                    </Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending}>
                    {isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Оновлення...</>
                    ) : "Оновити турнір"}
                </Button>
            </div>
        </form>
    );
}