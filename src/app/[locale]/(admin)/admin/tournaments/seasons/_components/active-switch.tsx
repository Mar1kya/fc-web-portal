"use client"

import { useTransition } from "react"
import { Season } from "../../../../../../../../generated/prisma"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { toggleActiveSeason } from "@/actions/season"

export function ActiveSwitch({ season }: { season: Season }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        if (season.isActive) {
            toast.info("Цей сезон вже активний. Щоб вимкнути його, зробіть активним інший сезон.");
            return;
        }

        startTransition(async () => {
            const result = await toggleActiveSeason(season.id);
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
                checked={season.isActive}
                onCheckedChange={handleToggle}
                disabled={isPending || season.isActive}
            />
            {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {season.isActive && !isPending && (
                <Badge variant="default" className="bg-emerald-600">Активний</Badge>
            )}
        </div>
    );
}