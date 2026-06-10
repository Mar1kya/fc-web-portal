"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tournament } from "../../../../../../../../generated/prisma";
import { toggleTournamentStandings } from "@/actions/tournament";

export function StandingsSwitch({ tournament }: { tournament: Tournament }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        startTransition(async () => {
            const result = await toggleTournamentStandings(tournament.id, checked);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message || "Помилка");
            }
        });
    };

    return (
        <div className="flex items-center gap-3">
            <Switch
                checked={tournament.hasStandings}
                onCheckedChange={handleToggle}
                disabled={isPending}
            />
            {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {tournament.hasStandings && !isPending && (
                <Badge variant="default" className="bg-emerald-600">

                    Є таблиця
                </Badge>
            )}
        </div>
    );
}