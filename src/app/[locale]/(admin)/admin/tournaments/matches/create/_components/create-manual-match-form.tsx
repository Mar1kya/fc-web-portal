"use client"

import { useState, useActionState, useEffect } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { TeamContext } from "../../../../../../../../../generated/prisma"
import { teamContextTranslations } from "@/lib/constants"
import { BoundMatchData, createManualMatch } from "@/actions/match"

type SelectOption = {
    id: string;
    name: string;
}

type SeasonOption = SelectOption & {
    startDate: Date | null;
    endDate: Date | null;
};

type CreateManualMatchFormProps = {
    seasons: SeasonOption[]; 
    tournaments: SelectOption[];
    opponents: SelectOption[];
}

export function CreateManualMatchForm({ seasons, tournaments, opponents }: CreateManualMatchFormProps) {
    const router = useRouter();
    const [seasonId, setSeasonId] = useState<string>("");
    const [tournamentId, setTournamentId] = useState<string>("");
    const [opponentId, setOpponentId] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [isHomeGame, setIsHomeGame] = useState<boolean>(true);
    const [teamContext, setTeamContext] = useState<TeamContext>(TeamContext.MAIN_TEAM);
    const [stadium, setStadium] = useState<string>("");
    const [homeCoachName, setHomeCoachName] = useState<string>("");
    const [awayCoachName, setAwayCoachName] = useState<string>("");
    const [round, setRound] = useState<number | "">("");

    function toDatetimeLocalValue(date: Date): string {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    }

    const selectedSeason = seasons.find(s => s.id === seasonId);

    const seasonMinDateValue = selectedSeason?.startDate
        ? toDatetimeLocalValue(new Date(selectedSeason.startDate))
        : undefined;

    const seasonMaxDateValue = selectedSeason?.endDate
        ? toDatetimeLocalValue(
            new Date(new Date(selectedSeason.endDate).setHours(23, 59, 59, 999))
        )
        : undefined;

    const isDateOutOfSeasonRange = Boolean(
        selectedSeason?.startDate &&
        selectedSeason?.endDate &&
        date &&
        (new Date(date) < new Date(selectedSeason.startDate) ||
            new Date(date) > new Date(new Date(selectedSeason.endDate).setHours(23, 59, 59, 999)))
    );

    const boundData: BoundMatchData = {
        seasonId,
        tournamentId,
        opponentId,
        date: date ? new Date(date) : new Date(),
        isHomeGame,
        teamContext,
        stadium,
        homeCoachName,
        awayCoachName,
        round: round === "" ? undefined : Number(round),
    };

    const createMatchWithData = createManualMatch.bind(null, boundData);
    const [state, actionFn, isPending] = useActionState(createMatchWithData, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push("/admin/tournaments/matches");
            router.refresh();
        } else if (state?.message && !state.success) {
            toast.error(state.message);
        }
    }, [state, router]);

    return (
        <form action={actionFn} className="space-y-6">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Новий матч (Ручне створення)</CardTitle>
                    <CardDescription>
                        Створіть матч вручну, якщо його ще немає в системі SofaScore.
                        Він буде відображатися зі статусом SCHEDULED.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Сезон <span className="text-red-500">*</span></Label>
                            <Select value={seasonId} onValueChange={setSeasonId} disabled={isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Оберіть сезон" />
                                </SelectTrigger>
                                <SelectContent>
                                    {seasons.map((season) => (
                                        <SelectItem key={season.id} value={season.id}>
                                            {season.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state?.errors?.seasonId && <p className="text-red-500 text-sm">{state.errors.seasonId[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Турнір <span className="text-red-500">*</span></Label>
                            <Select value={tournamentId} onValueChange={setTournamentId} disabled={isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Оберіть турнір" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tournaments.map((tournament) => (
                                        <SelectItem key={tournament.id} value={tournament.id}>
                                            {tournament.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state?.errors?.tournamentId && <p className="text-red-500 text-sm">{state.errors.tournamentId[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Суперник <span className="text-red-500">*</span></Label>
                            <Select value={opponentId} onValueChange={setOpponentId} disabled={isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Оберіть суперника" />
                                </SelectTrigger>
                                <SelectContent>
                                    {opponents.map((opponent) => (
                                        <SelectItem key={opponent.id} value={opponent.id}>
                                            {opponent.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state?.errors?.opponentId && <p className="text-red-500 text-sm">{state.errors.opponentId[0]}</p>}
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
                            <Label htmlFor="matchDate">Дата та час матчу <span className="text-red-500">*</span></Label>
                            <Input
                                id="matchDate"
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={seasonMinDateValue}
                                max={seasonMaxDateValue}
                                disabled={isPending}
                            />
                            {selectedSeason?.startDate && selectedSeason?.endDate && (
                                <p className="text-xs text-muted-foreground">
                                    Сезон {selectedSeason.name}: {new Intl.DateTimeFormat("uk").format(new Date(selectedSeason.startDate))} — {new Intl.DateTimeFormat("uk").format(new Date(selectedSeason.endDate))}
                                </p>
                            )}
                            {isDateOutOfSeasonRange && (
                                <p className="text-red-500 text-xs">
                                    Дата виходить за межі обраного сезону
                                </p>
                            )}
                            {state?.errors?.date && <p className="text-red-500 text-sm">{state.errors.date[0]}</p>}
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm h-fit self-end mb-1">
                            <div className="space-y-0.5">
                                <Label htmlFor="isHomeGame" className="text-base font-medium">
                                    Домашня гра
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Чи граємо ми на своєму полі?
                                </p>
                            </div>
                            <Switch
                                id="isHomeGame"
                                checked={isHomeGame}
                                onCheckedChange={setIsHomeGame}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Додаткова інформація (Опціонально)</CardTitle>
                    <CardDescription>
                        Ці дані можна заповнити пізніше під час редагування матчу.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="stadium">Стадіон</Label>
                            <Input
                                id="stadium"
                                value={stadium}
                                onChange={(e) => setStadium(e.target.value)}
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="round">Тур / Раунд</Label>
                            <Input
                                id="round"
                                type="number"
                                min={1}
                                value={round}
                                onChange={(e) => setRound(e.target.value ? Number(e.target.value) : "")}
                                placeholder="Наприклад: 5"
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="homeCoachName">Тренер господарів</Label>
                            <Input
                                id="homeCoachName"
                                value={homeCoachName}
                                onChange={(e) => setHomeCoachName(e.target.value)}
                                placeholder={isHomeGame ? "Ім'я нашого тренера" : "Тренер суперника"}
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="awayCoachName">Тренер гостей</Label>
                            <Input
                                id="awayCoachName"
                                value={awayCoachName}
                                onChange={(e) => setAwayCoachName(e.target.value)}
                                placeholder={isHomeGame ? "Тренер суперника" : "Ім'я нашого тренера"}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex flex-col sm:flex-row gap-4 border-t border-border justify-end pt-6 mt-4">
                <Button type="button" variant="outline" asChild disabled={isPending} className="w-full sm:w-32">
                    <Link href="/admin/tournaments/matches">
                        Скасувати
                    </Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending}>
                    {isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Збереження...</>
                    ) : "Створити матч"}
                </Button>
            </div>
        </form>
    );
}