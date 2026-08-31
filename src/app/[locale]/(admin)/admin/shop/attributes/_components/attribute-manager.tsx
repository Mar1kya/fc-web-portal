"use client"

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createColor, deleteColor, createApparelType, deleteApparelType } from "@/actions/attributes";

type AttributeItem = { id: string; name_uk: string; name_en: string; hexCode?: string };

type Props = {
    kind: "color" | "apparelType";
    initialItems: AttributeItem[];
};

const KIND_LABELS: Record<Props["kind"], { formTitle: string; listTitle: string }> = {
    color: { formTitle: "Новий колір", listTitle: "Усі кольори" },
    apparelType: { formTitle: "Новий тип одягу", listTitle: "Усі типи одягу" },
};

export function AttributeManager({ kind, initialItems }: Props) {
    const [items, setItems] = useState(initialItems);
    const [nameUk, setNameUk] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [hex, setHex] = useState("#000000");
    const [isPending, setIsPending] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const labels = KIND_LABELS[kind];

    const handleCreate = async () => {
        setErrors({});
        setIsPending(true);

        const res = kind === "color"
            ? await createColor({ name_uk: nameUk, name_en: nameEn, hexCode: hex })
            : await createApparelType({ name_uk: nameUk, name_en: nameEn });

        setIsPending(false);

        if (res.success && res.item) {
            setItems(prev => [...prev, {
                id: res.item!.id,
                name_uk: nameUk,
                name_en: nameEn,
                ...(kind === "color" ? { hexCode: hex } : {}),
            }]);
            setNameUk("");
            setNameEn("");
            setHex("#000000");
            toast.success(res.message);
        } else {
            if (res.errors) setErrors(res.errors);
            toast.error(res.message);
        }
    };

    const handleDelete = async (id: string) => {
        const res = kind === "color" ? await deleteColor(id) : await deleteApparelType(id);
        if (res.success) {
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success(res.message);
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-none border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg">{labels.formTitle}</CardTitle>
                    <CardDescription>Назва додається одразу двома мовами.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                        <div className="space-y-2">
                            <Label htmlFor="name_uk">Назва (українською) <span className="text-red-500">*</span></Label>
                            <Input
                                id="name_uk"
                                value={nameUk}
                                onChange={e => setNameUk(e.target.value)}
                                disabled={isPending}
                                placeholder="напр. Червоний"
                            />
                            {errors.name_uk && <p className="text-red-500 text-xs">{errors.name_uk[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name_en">Назва (англійською) <span className="text-red-500">*</span></Label>
                            <Input
                                id="name_en"
                                value={nameEn}
                                onChange={e => setNameEn(e.target.value)}
                                disabled={isPending}
                                placeholder="e.g. Red"
                            />
                            {errors.name_en && <p className="text-red-500 text-xs">{errors.name_en[0]}</p>}
                        </div>
                        {kind === "color" && (
                            <div className="space-y-2">
                                <Label htmlFor="hexCode">Колір (HEX) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="hexCode"
                                    type="color"
                                    value={hex}
                                    onChange={e => setHex(e.target.value)}
                                    className="h-10 w-full p-1"
                                    disabled={isPending}
                                />
                                {errors.hexCode && <p className="text-red-500 text-xs">{errors.hexCode[0]}</p>}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-end py-4">
                            <Button type="button" onClick={handleCreate} disabled={isPending} className="w-full sm:w-auto min-w-48">
                                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Додавання...</> : "Додати"}
                            </Button>
                        </div>
                </CardContent>
            </Card>
            <Card className="shadow-none border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg">{labels.listTitle}</CardTitle>
                    <CardDescription>Всього записів: {items.length}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Ще немає записів</p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex items-center justify-between border rounded-md px-3 py-2 bg-muted/10">
                                <div className="flex items-center gap-2">
                                    {item.hexCode && (
                                        <span className="h-4 w-4 rounded-full border border-border shrink-0" style={{ backgroundColor: item.hexCode }} />
                                    )}
                                    <span className="text-sm">
                                        {item.name_uk} <span className="text-muted-foreground">/ {item.name_en}</span>
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}