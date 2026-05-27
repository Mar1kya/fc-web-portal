"use client"

import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useTransition, useEffect, useState } from "react";
import { retryPayment } from "@/actions/payment";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type RetryPaymentButtonProps = {
    orderId: string;
    expiresAt: number;
};

export default function RetryPaymentButton({ orderId, expiresAt }: RetryPaymentButtonProps) {
    const [isPending, startTransition] = useTransition();
    const t = useTranslations("Shop.OrderPage");
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        const calculateTime = () => {
            const now = Date.now();
            const diff = expiresAt - now;

            if (diff <= 0) {
                setTimeLeft("00:00");
                router.refresh();
            } else {
                const minutes = Math.floor(diff / 1000 / 60).toString().padStart(2, "0");
                const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");
                setTimeLeft(`${minutes}:${seconds}`);
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [expiresAt, router]);

    const handlePayment = () => {
        startTransition(async () => {
            const result = await retryPayment(orderId);

            if (result?.error) {
                if (result.error === "cancelled") {
                    toast.error(t("errorCancelled"));
                } else if (result.error === "alreadyPaid") {
                    toast.success(t("errorAlreadyPaid"));
                } else {
                    toast.error(t("errorGeneric"));
                }
                router.refresh();
            }
        });
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={isPending || timeLeft === "00:00"}
            className="w-full sm:w-auto font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 transition-all"
        >
            {isPending ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("processing")}
                </>
            ) : (
                <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t("retryPayment")} {timeLeft ? `(${timeLeft})` : ""}
                </>
            )}
        </Button>
    );
}