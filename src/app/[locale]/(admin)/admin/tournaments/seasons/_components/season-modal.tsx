"use client"

import { useState, useTransition, useEffect } from "react"
import { Season } from "../../../../../../../../generated/prisma"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { BoundSeasonData, createSeason, updateSeason } from "@/actions/season"

interface SeasonModalProps {
    season?: Season;
    trigger: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function SeasonModal({ season, trigger, open: controlledOpen, onOpenChange }: SeasonModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && !season) {
            setName("");
            setSofascoreId("");
            setIsActive(false);
            setStartDate("");
            setEndDate("");
            setErrors({});
        }

        if (isControlled && onOpenChange) onOpenChange(newOpen);
        else setInternalOpen(newOpen);
    };
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [name, setName] = useState(season?.name || "");
    const [sofascoreId, setSofascoreId] = useState(season?.sofascoreId?.toString() || "");
    const [isActive, setIsActive] = useState(season?.isActive || false);
    const [startDate, setStartDate] = useState(
        season?.startDate ? new Date(season.startDate).toISOString().split('T')[0] : ""
    );
    const [endDate, setEndDate] = useState(
        season?.endDate ? new Date(season.endDate).toISOString().split('T')[0] : ""
    );

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const boundData = {
            name,
            sofascoreId: sofascoreId ? Number(sofascoreId) : null,
            startDate: startDate,
            endDate: endDate,
            isActive,
        } as unknown as BoundSeasonData;

        startTransition(async () => {
            const result = season
                ? await updateSeason(season.id, boundData, undefined, new FormData())
                : await createSeason(boundData, undefined, new FormData());

            if (result?.success) {
                toast.success(result.message);
                handleOpenChange(false);
                router.refresh();
            } else if (result?.errors) {
                setErrors(result.errors);
                toast.error("Перевірте правильність заповнення полів");
            } else {
                toast.error(result?.message || "Сталася помилка");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>{season ? "Редагування сезону" : "Створення нового сезону"}</DialogTitle>
                    <DialogDescription>
                        {season ? "Змініть необхідні параметри сезону." : "Заповніть дані для створення нового сезону."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Назва сезону <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            placeholder="Наприклад: 2025/26"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isPending}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Початок <span className="text-red-500">*</span></Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={isPending}
                            />
                            {errors.startDate && <p className="text-sm text-red-500">{errors.startDate[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Завершення <span className="text-red-500">*</span></Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={isPending}
                            />
                            {errors.endDate && <p className="text-sm text-red-500">{errors.endDate[0]}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sofascoreId">SofaScore ID (Опціонально)</Label>
                        <Input
                            id="sofascoreId"
                            placeholder="Наприклад: 52182"
                            value={sofascoreId}
                            onChange={(e) => setSofascoreId(e.target.value)}
                            disabled={isPending}
                        />
                        {errors.sofascoreId && <p className="text-sm text-red-500">{errors.sofascoreId[0]}</p>}
                    </div>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-2">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Зробити активним</Label>
                            <p className="text-[12px] text-muted-foreground leading-tight">
                                Цей сезон буде відображатися на сайті за замовчуванням
                            </p>
                        </div>
                        <Switch
                            checked={isActive}
                            onCheckedChange={setIsActive}
                            disabled={isPending || (season?.isActive)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                            Скасувати
                        </Button>
                        <Button type="submit" disabled={isPending} className="min-w-30">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {season ? "Зберегти" : "Створити"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}