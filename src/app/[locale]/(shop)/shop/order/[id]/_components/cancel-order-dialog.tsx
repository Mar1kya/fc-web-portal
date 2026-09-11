"use client";

import { useEffect, useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Ban, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cancelOrderByUser } from "@/actions/order";

type CancelOrderDialogProps = {
    orderId: string;
};

export default function CancelOrderDialog({ orderId }: CancelOrderDialogProps) {
    const t = useTranslations("Shop.OrderPage.Cancel");
    const [open, setOpen] = useState(false);
    const [state, actionFn, isPending] = useActionState(
        cancelOrderByUser.bind(null, orderId),
        undefined,
    );

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            const timer = setTimeout(() => {
                setOpen(false);
            }, 0);
            return () => clearTimeout(timer);
        } else if (state?.message) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 font-medium text-destructive hover:text-destructive">
                    <Ban className="w-4 h-4" />
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
                <form action={actionFn}>
                    <DialogFooter className="gap-2 sm:gap-2 mt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            {t("dismiss")}
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("confirming")}
                                </>
                            ) : (
                                t("confirm")
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}