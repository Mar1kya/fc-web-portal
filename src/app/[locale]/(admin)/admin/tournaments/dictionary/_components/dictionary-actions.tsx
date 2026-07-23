"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { updateDictionaryEntry, BoundDictionaryData } from "@/actions/dictionary";
import { TeamDictionary, TeamDictionaryTranslation } from "../../../../../../../../generated/prisma";

type DictionaryWithTranslations = TeamDictionary & {
    translations: TeamDictionaryTranslation[];
};

type DictionaryActionsProps = {
    entry: DictionaryWithTranslations;
}

export function DictionaryActions({ entry }: DictionaryActionsProps) {
    const txUk = entry.translations.find(t => t.language === "uk");
    const txEn = entry.translations.find(t => t.language === "en");

    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const [nameUk, setNameUk] = useState(txUk?.name || entry.originalName);
    const [nameEn, setNameEn] = useState(txEn?.name || entry.originalName);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setErrors({});
            setNameUk(txUk?.name || entry.originalName);
            setNameEn(txEn?.name || entry.originalName);
        }
        setOpen(newOpen);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const boundData: BoundDictionaryData = {
            name_uk: nameUk,
            name_en: nameEn
        };

        startTransition(async () => {
            const result = await updateDictionaryEntry(entry.id, boundData, undefined, new FormData());

            if (result?.success) {
                toast.success(result.message);
                handleOpenChange(false);
            } else if (result?.errors) {
                setErrors(result.errors as Record<string, string[]>);
                toast.error(result.message || "Перевірте правильність заповнення полів");
            } else {
                toast.error(result?.message || "Сталася помилка");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Редагувати
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Редагування перекладу</DialogTitle>
                    <DialogDescription>
                        Оригінальна назва з SofaScore: <strong className="text-foreground">{entry.originalName}</strong>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="nameUk">Назва українською <span className="text-red-500">*</span></Label>
                        <Input
                            id="nameUk"
                            value={nameUk}
                            onChange={(e) => setNameUk(e.target.value)}
                            disabled={isPending}
                        />
                        {errors.name_uk && <p className="text-sm text-red-500">{errors.name_uk[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nameEn">Назва англійською <span className="text-red-500">*</span></Label>
                        <Input
                            id="nameEn"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            disabled={isPending}
                        />
                        {errors.name_en && <p className="text-sm text-red-500">{errors.name_en[0]}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                            Скасувати
                        </Button>
                        <Button type="submit" disabled={isPending} className="min-w-30">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Оновити
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}