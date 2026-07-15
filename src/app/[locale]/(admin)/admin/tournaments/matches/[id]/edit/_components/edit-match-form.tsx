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
import { EventType, Match, MatchEvent, MatchLineup, MatchStatus, TeamContext } from "../../../../../../../../../../generated/prisma"
import { teamContextTranslations, matchStatusTranslations } from "@/lib/constants"
import { BoundMatchUpdateData, updateMatch } from "@/actions/match"

type SelectOption = { id: string; name: string; number?: number; hasStandings?: boolean }

type SeasonOption = SelectOption & {
    startDate: Date | null;
    endDate: Date | null;
};



type MatchWithDetails = Match & {
    lineup: MatchLineup[];
    events: MatchEvent[];
}

type EditMatchFormProps = {
    initialData: MatchWithDetails;
    seasons: SeasonOption[];
    tournaments: SelectOption[];
    opponents: SelectOption[];
    players: SelectOption[];
}

const eventTypeTranslations: Record<EventType, string> = {
    GOAL: "Гол",
    ASSIST: "Асист",
    YELLOW_CARD: "Жовта картка",
    RED_CARD: "Червона картка",
    SUBSTITUTION_IN: "Вихід на заміну",
    SUBSTITUTION_OUT: "Відхід з поля",
};
type MatchFormEvent = {
    id: string;
    type: EventType;
    minute: number;
    playerId: string | null;
    customPlayerName: string | null;
    isOpponent: boolean;
    goalModifier: 'NONE' | 'PENALTY' | 'OWN_GOAL';
};

export function EditMatchForm({ initialData, seasons, tournaments, opponents, players }: EditMatchFormProps) {
    const router = useRouter();
    const [seasonId, setSeasonId] = useState(initialData.seasonId || "");
    const [tournamentId, setTournamentId] = useState(initialData.tournamentId || "");
    const [opponentId, setOpponentId] = useState(initialData.opponentId || "");
    const formattedDate = new Date(initialData.date.getTime() - (initialData.date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    const [date, setDate] = useState(formattedDate);
    const [isHomeGame, setIsHomeGame] = useState(initialData.isHomeGame);
    const [teamContext, setTeamContext] = useState<TeamContext>(initialData.teamContext);
    const [status, setStatus] = useState<MatchStatus>(initialData.status);
    const [round, setRound] = useState<number | "">(initialData.round || "");
    const [homeScore, setHomeScore] = useState<number | "">(initialData.homeScore ?? "");
    const [awayScore, setAwayScore] = useState<number | "">(initialData.awayScore ?? "");
    const [stadium, setStadium] = useState(initialData.stadium || "");
    const [homeCoachName, setHomeCoachName] = useState(initialData.homeCoachName || "");
    const [awayCoachName, setAwayCoachName] = useState(initialData.awayCoachName || "");
    const [highlightsUrl, setHighlightsUrl] = useState(initialData.highlightsUrl || "");
    const [postMatchUrl, setPostMatchUrl] = useState(initialData.postMatchUrl || "");

    const [lineup, setLineup] = useState<{ playerId: string; isStarter: boolean; inSquad: boolean }[]>(
        initialData.lineup.map(l => ({
            playerId: l.playerId,
            isStarter: l.isStarter,
            inSquad: true
        }))
    );

    const startersCount = lineup.filter(l => l.isStarter).length;
    const squadCount = lineup.filter(l => l.inSquad).length;

    const togglePlayer = (playerId: string, field: 'inSquad' | 'isStarter') => {
        setLineup(prev => {
            const existing = prev.find(p => p.playerId === playerId);
            const currentIsStarter = existing?.isStarter || false;

            if (field === 'isStarter' && !currentIsStarter && startersCount >= 11) {
                toast.warning("В основі не може бути більше 11 гравців!");
                return prev;
            }

            if (existing) {
                const newInSquad = field === 'inSquad' ? !existing.inSquad : existing.inSquad;
                const newStarter = field === 'isStarter' ? !existing.isStarter : existing.isStarter;
                return prev.map(p => p.playerId === playerId
                    ? { ...p, inSquad: newInSquad, isStarter: newInSquad ? newStarter : false }
                    : p);
            }
            return [...prev, { playerId, inSquad: field === 'inSquad', isStarter: field === 'isStarter' }];
        });
    };

    const [events, setEvents] = useState<MatchFormEvent[]>(
        initialData.events.map(e => {
            let modifier: 'NONE' | 'PENALTY' | 'OWN_GOAL' = 'NONE';
            let cleanCustomName = e.customPlayerName || "";

            if (cleanCustomName.includes('(OG)')) {
                modifier = 'OWN_GOAL';
                cleanCustomName = cleanCustomName.replace('(OG)', '').trim();
            } else if (cleanCustomName.includes('(Pen.)')) {
                modifier = 'PENALTY';
                cleanCustomName = cleanCustomName.replace('(Pen.)', '').trim();
            }

            return {
                id: e.id,
                type: e.type,
                minute: e.minute,
                playerId: e.playerId,
                customPlayerName: cleanCustomName === "" ? null : cleanCustomName,
                isOpponent: e.isOpponent,
                goalModifier: modifier
            };
        })
    );

    const addEvent = () => {
        setEvents(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            type: EventType.GOAL, minute: 1, playerId: null, customPlayerName: null, isOpponent: false, goalModifier: 'NONE'
        }]);
    };

    const updateEvent = <K extends keyof MatchFormEvent>(
        index: number,
        field: K,
        value: MatchFormEvent[K]
    ) => {
        setEvents(prevEvents => {
            const newEvents = [...prevEvents];
            newEvents[index] = {
                ...newEvents[index],
                [field]: value
            };
            return newEvents;
        });
    };

    const removeEvent = (index: number) => {
        setEvents(prev => prev.filter((_, i) => i !== index));
    };

    const handleHomeGameToggle = (checked: boolean) => {
        setIsHomeGame(checked);
        const tempCoach = homeCoachName;
        setHomeCoachName(awayCoachName);
        setAwayCoachName(tempCoach);
        const tempScore = homeScore;
        setHomeScore(awayScore);
        setAwayScore(tempScore);
    };
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

    const boundData = {
        seasonId, tournamentId, opponentId, isHomeGame, teamContext, status,
        round: round === "" ? undefined : Number(round),
        homeScore: homeScore === "" ? undefined : Number(homeScore),
        awayScore: awayScore === "" ? undefined : Number(awayScore),
        stadium, homeCoachName, awayCoachName, highlightsUrl, postMatchUrl,
        emeraldGangLineup: lineup
            .filter(l => l.inSquad)
            .map(l => ({
                playerId: l.playerId,
                isStarter: l.isStarter,
                played: l.isStarter || events.some(
                    e => e.type === EventType.SUBSTITUTION_IN &&
                        e.playerId === l.playerId &&
                        !e.isOpponent
                ),
            })),
        events: events.map(({ id, goalModifier, ...rest }) => {
            let finalCustomName = rest.customPlayerName || "";

            if (rest.type === EventType.GOAL) {
                if (goalModifier === 'OWN_GOAL') finalCustomName += " (OG)";
                if (goalModifier === 'PENALTY') finalCustomName += " (Pen.)";
            }

            return {
                ...rest,
                customPlayerName: finalCustomName.trim() === "" ? null : finalCustomName.trim()
            };
        })
    } as BoundMatchUpdateData;

    if (date) {
        boundData.date = new Date(date);
    }

    const updateMatchWithId = updateMatch.bind(null, initialData.id, boundData);
    const [state, actionFn, isPending] = useActionState(updateMatchWithId, undefined);

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
            <Tabs defaultValue="main" className="w-full">
                <TabsList className="flex flex-wrap w-full max-w-fit mb-6 justify-start h-auto gap-1">
                    <TabsTrigger
                        value="main"
                        className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border rounded-md px-4 py-2 data-[state=inactive]:opacity-50 hover:opacity-100 transition-opacity"
                    >
                        Головне
                    </TabsTrigger>
                    <TabsTrigger
                        value="lineup"
                        className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border rounded-md px-4 py-2 data-[state=inactive]:opacity-50 hover:opacity-100 transition-opacity"
                    >
                        Склад (Emerald Gang)
                    </TabsTrigger>
                    <TabsTrigger
                        value="events"
                        className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border rounded-md px-4 py-2 data-[state=inactive]:opacity-50 hover:opacity-100 transition-opacity"
                    >
                        Події
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="main" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-none border-border/50">
                            <CardHeader><CardTitle className="text-lg">Деталі матчу</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Статус <span className="text-red-500">*</span></Label>
                                    <Select value={status} onValueChange={(val) => setStatus(val as MatchStatus)} disabled={isPending}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(matchStatusTranslations).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Забиті голи (Вдома)</Label>
                                        <Input type="number" min={0} value={homeScore} onChange={e => setHomeScore(e.target.value ? Number(e.target.value) : "")} disabled={isPending} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Пропущені (Виїзд)</Label>
                                        <Input type="number" min={0} value={awayScore} onChange={e => setAwayScore(e.target.value ? Number(e.target.value) : "")} disabled={isPending} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Дата та час <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="datetime-local"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
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
                                        {state?.errors?.date && <p className="text-red-500 text-xs">{state.errors.date[0]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Тур / Раунд</Label>
                                        <Input type="number" min={1} value={round} onChange={e => setRound(e.target.value ? Number(e.target.value) : "")} disabled={isPending} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Стадіон</Label>
                                    <Input value={stadium} onChange={e => setStadium(e.target.value)} disabled={isPending} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-none border-border/50">
                            <CardHeader><CardTitle className="text-lg">Турнір та Команди</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Сезон <span className="text-red-500">*</span></Label>
                                        <Select value={seasonId} onValueChange={setSeasonId} disabled={isPending}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {state?.errors?.seasonId && <p className="text-red-500 text-xs">{state.errors.seasonId[0]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Команда <span className="text-red-500">*</span></Label>
                                        <Select value={teamContext} onValueChange={(val) => setTeamContext(val as TeamContext)} disabled={isPending}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(teamContextTranslations).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Турнір <span className="text-red-500">*</span></Label>
                                    <Select value={tournamentId} onValueChange={setTournamentId} disabled={isPending}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {tournaments.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {state?.errors?.tournamentId && <p className="text-red-500 text-xs">{state.errors.tournamentId[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Суперник <span className="text-red-500">*</span></Label>
                                    <Select value={opponentId} onValueChange={setOpponentId} disabled={isPending}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {opponents.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {state?.errors?.opponentId && <p className="text-red-500 text-xs">{state.errors.opponentId[0]}</p>}
                                </div>
                                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/10">
                                    <Label className="text-sm font-medium cursor-pointer">Домашня гра (Emerald Gang)</Label>
                                    <Switch checked={isHomeGame} onCheckedChange={handleHomeGameToggle} disabled={isPending} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    <Card className="shadow-none border-border/50">
                        <CardHeader><CardTitle className="text-lg">Медіа та Посилання</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>YouTube Хайлайти (URL)</Label>
                                <Input type="url" value={highlightsUrl} onChange={e => setHighlightsUrl(e.target.value)} disabled={isPending} placeholder="https://youtube.com/..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Звіт про матч (URL)</Label>
                                <Input type="url" value={postMatchUrl} onChange={e => setPostMatchUrl(e.target.value)} disabled={isPending} placeholder="https://..." />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="lineup" className="outline-none">
                    <Card className="shadow-none border-border/50">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-lg">Склад Emerald Gang</CardTitle>
                                <CardDescription>Відмітьте гравців, які були в заявці та виходили в основі.</CardDescription>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium mt-2 sm:mt-0">
                                <div className="bg-muted px-3 py-1.5 rounded-md">
                                    В заявці: <span className="text-primary">{squadCount}</span>
                                </div>
                                <div className={`px-3 py-1.5 rounded-md transition-colors ${startersCount !== 11 ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
                                    Основа: <span>{startersCount} / 11</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-125 pr-4 rounded-md">
                                <div className="p-2 space-y-1">
                                    {players.map((player) => {
                                        const playerState = lineup.find(l => l.playerId === player.id) || { inSquad: false, isStarter: false };
                                        return (
                                            <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors gap-3">
                                                <span className="font-medium">{player.number ? `${player.number}. ` : ''}{player.name}</span>
                                                <div className="flex gap-6">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id={`played-${player.id}`} checked={playerState.inSquad} onCheckedChange={() => togglePlayer(player.id, 'inSquad')} disabled={isPending} />
                                                        <Label htmlFor={`played-${player.id}`} className="cursor-pointer font-normal">В заявці</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 w-24">
                                                        <Checkbox id={`starter-${player.id}`} checked={playerState.isStarter} onCheckedChange={() => togglePlayer(player.id, 'isStarter')} disabled={!playerState.inSquad || isPending} />
                                                        <Label htmlFor={`starter-${player.id}`} className={`cursor-pointer font-normal ${!playerState.inSquad ? 'opacity-50' : ''}`}>Основа</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="events" className="outline-none">
                    <Card className="shadow-none border-border/50">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                            <div>
                                <CardTitle className="text-lg">Події матчу</CardTitle>
                                <CardDescription>Голи, картки, заміни (до 120 хв з урахуванням екстра-таймів).</CardDescription>
                            </div>
                            <Button type="button" onClick={addEvent} variant="secondary" size="sm" disabled={isPending}>
                                <Plus className="w-4 h-4 mr-2" /> Додати подію
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {events.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                                    Подій ще немає
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {events.map((ev, idx) => (
                                        <div key={ev.id} className="relative grid grid-cols-1 md:grid-cols-12 gap-4 items-start border p-4 pt-10 md:pt-4 rounded-lg bg-muted/20">

                                            <div className="absolute right-2 top-2">
                                                <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8" size="icon" onClick={() => removeEvent(idx)} disabled={isPending}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label>Хвилина <span className="text-red-500">*</span></Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={120}
                                                    value={ev.minute}
                                                    onChange={(e) => {
                                                        let val = Number(e.target.value);
                                                        if (val > 120) val = 120;
                                                        if (val < 1 && e.target.value !== "") val = 1;
                                                        updateEvent(idx, 'minute', val);
                                                    }}
                                                    disabled={isPending}
                                                />
                                            </div>

                                            <div className="md:col-span-3 space-y-2">
                                                <Label>Тип <span className="text-red-500">*</span></Label>
                                                <Select
                                                    value={ev.type}
                                                    onValueChange={(val) => {
                                                        const newEvents = [...events];
                                                        newEvents[idx].type = val as EventType;
                                                        if (val !== EventType.GOAL) {
                                                            newEvents[idx].goalModifier = 'NONE';
                                                        }
                                                        setEvents(newEvents);
                                                    }}
                                                    disabled={isPending}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(eventTypeTranslations).map(([key, label]) => (
                                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="md:col-span-2 flex items-center space-x-2 mt-2 md:mt-8">
                                                <Switch checked={ev.isOpponent} onCheckedChange={(val) => {
                                                    const newEvents = [...events];
                                                    newEvents[idx].isOpponent = val;
                                                    newEvents[idx].playerId = null;
                                                    setEvents(newEvents);
                                                }} disabled={isPending} />
                                                <Label className="cursor-pointer">Суперник?</Label>
                                            </div>

                                            <div className="md:col-span-5 space-y-2 pr-0 md:pr-8">
                                                <Label>{ev.isOpponent ? "Ім'я суперника" : "Гравець Emerald Gang"}</Label>
                                                {ev.isOpponent ? (
                                                    <Input placeholder="Введіть ім'я..." value={ev.customPlayerName || ""} onChange={(e) => updateEvent(idx, 'customPlayerName', e.target.value)} disabled={isPending} />
                                                ) : (
                                                    <Select value={ev.playerId || ""} onValueChange={(val) => updateEvent(idx, 'playerId', val)} disabled={isPending}>
                                                        <SelectTrigger><SelectValue placeholder="Оберіть гравця" /></SelectTrigger>
                                                        <SelectContent>
                                                            {players.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                                {ev.type === EventType.GOAL && (
                                                    <div className="flex gap-6 pt-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`pen-${ev.id}`}
                                                                checked={ev.goalModifier === 'PENALTY'}
                                                                onCheckedChange={(checked) => updateEvent(idx, 'goalModifier', checked ? 'PENALTY' : 'NONE')}
                                                                disabled={isPending}
                                                            />
                                                            <Label htmlFor={`pen-${ev.id}`} className="cursor-pointer text-sm font-normal">З пенальті</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`og-${ev.id}`}
                                                                checked={ev.goalModifier === 'OWN_GOAL'}
                                                                onCheckedChange={(checked) => updateEvent(idx, 'goalModifier', checked ? 'OWN_GOAL' : 'NONE')}
                                                                disabled={isPending}
                                                            />
                                                            <Label htmlFor={`og-${ev.id}`} className="cursor-pointer text-sm font-normal">Автогол</Label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <div className="flex flex-col sm:flex-row gap-4 justify-end border-t pt-6 mt-6">
                <Button type="button" variant="outline" asChild disabled={isPending} className="w-full sm:w-32">
                    <Link href="/admin/tournaments/matches">Скасувати</Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto min-w-48" disabled={isPending}>
                    {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Збереження...</> : "Зберегти зміни"}
                </Button>
            </div>
        </form>
    );
}