"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { upsertTournamentSeason } from "@/actions/tournament";

type ManageSeasonDialogProps = {
    tournamentId: string;
    tournamentName: string;
    activeSeasonId: string | null;
    activeSeasonName: string | null;
    currentSofascoreSeasonId: number | null;
};

export function ManageSeasonDialog({
    tournamentId,
    tournamentName,
    activeSeasonId,
    activeSeasonName,
    currentSofascoreSeasonId,
}: ManageSeasonDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [sofascoreSeasonId, setSofascoreSeasonId] = useState(
        currentSofascoreSeasonId != null ? currentSofascoreSeasonId.toString() : ""
    );

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setError(null);
            setSofascoreSeasonId(
                currentSofascoreSeasonId != null ? currentSofascoreSeasonId.toString() : ""
            );
        }
        setOpen(newOpen);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!activeSeasonId) {
            setError("Немає активного сезону в системі.");
            return;
        }

        const parsed = Number(sofascoreSeasonId);
        if (!sofascoreSeasonId || !Number.isFinite(parsed) || parsed <= 0) {
            setError("Введіть коректний числовий SofaScore Season ID.");
            return;
        }

        startTransition(async () => {
            const result = await upsertTournamentSeason(tournamentId, activeSeasonId, parsed);

            if (result?.success) {
                toast.success(result.message);
                handleOpenChange(false);
            } else {
                setError(result?.message || "Сталася помилка");
                toast.error(result?.message || "Сталася помилка");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                >
                    <CalendarCog className="mr-2 h-4 w-4" />
                    Керувати сезоном
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Прив&apos;язка сезону</DialogTitle>
                    <DialogDescription>
                        Турнір: <strong className="text-foreground">{tournamentName}</strong>
                        {activeSeasonName ? (
                            <> · Активний сезон: <strong className="text-foreground">{activeSeasonName}</strong></>
                        ) : null}
                    </DialogDescription>
                </DialogHeader>
                {!activeSeasonId ? (
                    <p className="text-sm text-red-500 pt-2">
                        Немає активного сезону — спочатку позначте сезон як активний.
                    </p>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="sofascoreSeasonId">
                                SofaScore Season ID <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="sofascoreSeasonId"
                                type="number"
                                placeholder="Наприклад: 61627"
                                value={sofascoreSeasonId}
                                onChange={(e) => setSofascoreSeasonId(e.target.value)}
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Знайти можна в URL сторінки турніру на sofascore.com — параметр
                                &quot;seasonId&quot; або в адресному рядку розділу &quot;Standings&quot;.
                            </p>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                                Скасувати
                            </Button>
                            <Button type="submit" disabled={isPending} className="min-w-30">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Зберегти
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}