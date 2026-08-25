"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CalendarSync } from "lucide-react";
import { executeStandingsSync, executeTournamentSeasonsBootstrap } from "@/actions/standings";

type Item = { id: string; name: string };

type ControlsProps = {
    seasons: Item[];
    tournaments: Item[];
    currentSeasonId: string;
    currentTournamentId: string;
};

export function StandingsControls({ seasons, tournaments, currentSeasonId, currentTournamentId }: ControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isSyncPending, startSyncTransition] = useTransition();
    const [isResolvePending, startResolveTransition] = useTransition();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleForceSync = () => {
        startSyncTransition(async () => {
            const result = await executeStandingsSync(
                undefined,
                currentTournamentId || undefined,
                currentSeasonId || undefined,
            );

            if (result.success) {
                toast.success(result.message || "Таблиці успішно оновлено!");
            } else {
                toast.error(result.message || "Помилка оновлення");
            }
        });
    };

    const handleResolveSeasons = () => {
        startResolveTransition(async () => {
            const result = await executeTournamentSeasonsBootstrap(currentSeasonId || undefined);

            if (result.success) {
                toast.success(result.message || "Сезони турнірів прив'язано!");
            } else {
                toast.error(result.message || "Помилка прив'язки сезонів");
            }
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={currentSeasonId} onValueChange={(val) => handleFilterChange("seasonId", val)}>
                    <SelectTrigger className="w-50">
                        <SelectValue placeholder="Оберіть сезон" />
                    </SelectTrigger>
                    <SelectContent>
                        {seasons.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={currentTournamentId} onValueChange={(val) => handleFilterChange("tournamentId", val)}>
                    <SelectTrigger className="w-50">
                        <SelectValue placeholder="Оберіть турнір" />
                    </SelectTrigger>
                    <SelectContent>
                        {tournaments.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                    onClick={handleResolveSeasons}
                    disabled={isResolvePending || isSyncPending}
                    variant="outline"
                    className="w-full sm:w-auto"
                    title="Прив'язати sofascoreSeasonId до кожного турніру для обраного сезону. Запускати раз на новий сезон."
                >
                    {isResolvePending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarSync className="w-4 h-4 mr-2" />}
                    Прив&apos;язати сезони турнірів
                </Button>
                <Button
                    onClick={handleForceSync}
                    disabled={isSyncPending || isResolvePending}
                    variant="outline"
                    className="w-full sm:w-auto"
                >
                    {isSyncPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Синхронізувати
                </Button>
            </div>
        </div>
    );
}