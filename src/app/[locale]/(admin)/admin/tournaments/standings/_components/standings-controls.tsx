"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { executeStandingsSync } from "@/actions/standings"; 

type Item = { id: string; slug: string; name: string };

type ControlsProps  = {
    seasons: Item[];
    tournaments: Item[];
    currentSeasonId: string;
    currentTournamentId: string;
}

export function StandingsControls({ seasons, tournaments, currentSeasonId, currentTournamentId }: ControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleForceSync = () => {
        startTransition(async () => {
            const result = await executeStandingsSync();
            
            if (result.success) {
                toast.success(result.message || "Таблиці успішно оновлено!");
            } else {
                toast.error(result.message || "Помилка оновлення");
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
            <Button 
                onClick={handleForceSync} 
                disabled={isPending} 
                variant="outline"
                className="w-full sm:w-auto"
            >
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Оновити таблицю з API
            </Button>
        </div>
    );
}