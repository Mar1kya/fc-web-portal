"use client"

import { useState, useEffect, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner" 
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { linkGuestOrder } from "@/actions/profile"

export default function LinkOrderModal() {
    const t = useTranslations("ProfilePage.LinkOrder");
    const [open, setOpen] = useState(false);
    const [state, actionFn, isPending] = useActionState(linkGuestOrder, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(t("success"));
            const timer = setTimeout(() => {
                setOpen(false);
            }, 0); 
            return () => clearTimeout(timer);
            
        } else if (state?.message) {
            toast.error(state.message);
        }
    }, [state, t]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 font-medium">
                    <Search className="w-4 h-4" />
                    {t("trigger")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                    <DialogDescription>
                        {t("description")}
                    </DialogDescription>
                </DialogHeader>
                <form action={actionFn} className="space-y-4 py-4">
                    <div className="space-y-1.5 flex flex-col w-full">
                        <Label htmlFor="orderId">{t("orderIdLabel")}</Label>
                        <Input 
                            id="orderId" 
                            name="orderId" 
                            placeholder={t("orderIdPlaceholder")} 
                            disabled={isPending}
                            className="w-full"
                        />
                        {state?.errors?.orderId && (
                            <p className="text-red-500 text-sm">{state.errors.orderId[0]}</p>
                        )}
                    </div>
                    <div className="space-y-1.5 flex flex-col w-full">
                        <Label htmlFor="phone">{t("phoneLabel")}</Label>
                        <Input 
                            id="phone" 
                            name="phone" 
                            placeholder={t("phonePlaceholder")} 
                            disabled={isPending}
                            className="w-full"
                        />
                        {state?.errors?.phone && (
                            <p className="text-red-500 text-sm">{state.errors.phone[0]}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("searching")}
                            </>
                        ) : (
                            t("submitButton")
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}