"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { syncMatchScheduleAction } from "@/actions/match";
import { TeamContext } from "../../../../../../../../generated/prisma";
import { SOFASCORE_TEAM_IDS } from "@/lib/constants";

type SyncScheduleButtonProps = {
    teamContext: TeamContext;
}

export function SyncScheduleButton({ teamContext }: SyncScheduleButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const isAvailable = Boolean(SOFASCORE_TEAM_IDS[teamContext]);

    const handleSync = () => {
        startTransition(async () => {
            try {
                const result = await syncMatchScheduleAction(teamContext);

                if (result.success) {
                    const created = result.created ?? 0;
                    const updated = result.updated ?? 0;

                    if (created === 0 && updated === 0) {
                        toast.info("Синхронізація завершена. Розклад актуальний, змін не виявлено.");
                    } else if (created === 0 && updated > 0) {
                        toast.success(`Синхронізація успішна! Оновлено інформацію по матчах: ${updated}.`);
                    } else if (created > 0 && updated === 0) {
                        toast.success(`Синхронізація успішна! Додано нові матчі: ${created}.`);
                    } else {
                        toast.success(`Синхронізація успішна! Додано нових: ${created}, оновлено: ${updated}.`);
                    }
                    router.refresh();
                } else {
                    toast.error(result.error || "Не вдалося синхронізувати розклад");
                }
            } catch {
                toast.error("Сталася непередбачувана помилка під час запиту");
            }
        });
    };

    if (!isAvailable) {
        return (
            <Button variant="outline" className="gap-2" disabled title="Sofascore ID для цієї команди не налаштовано">
                <RefreshCw className="w-4 h-4" />
                <span>Синхронізувати</span>
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            className="gap-2"
            onClick={handleSync}
            disabled={isPending}
        >
            {isPending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Синхронізація...</span>
                </>
            ) : (
                <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Синхронізувати</span>
                </>
            )}
        </Button>
    );
}