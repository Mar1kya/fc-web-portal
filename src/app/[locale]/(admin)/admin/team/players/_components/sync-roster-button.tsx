"use client"

import { useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { syncPlayersRoster } from "@/actions/team"

export function SyncRosterButton() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSync = () => {
        startTransition(async () => {
            try {
                const result = await syncPlayersRoster();

                if (result.success) {
                    const created = result.created ?? 0;
                    const updated = result.updated ?? 0;

                    if (created === 0 && updated === 0) {
                        toast.info("Синхронізація завершена. Дані ростеру актуальні, змін не виявлено.");
                    } else if (created === 0 && updated > 0) {
                        toast.success(`Синхронізація успішна! Оновлено профілів: ${updated}.`);
                    } else if (created > 0 && updated === 0) {
                        toast.success(`Синхронізація успішна! Додано нових гравців: ${created}.`);
                    } else {
                        toast.success(`Синхронізація успішна! Додано нових: ${created}, оновлено: ${updated}.`);
                    }
                    router.refresh();
                } else {
                    toast.error(result.message || "Не вдалося синхронізувати дані");
                }
            } catch (error) {
                toast.error("Сталася непередбачувана помилка під час запиту");
            }
        });
    };

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