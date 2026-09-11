"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { cancelExpiredOrders } from "@/lib/utils/expire-order";

type ExpireOrdersTriggerProps = {
    userId?: string;
};

export function ExpireOrdersTrigger({ userId }: ExpireOrdersTriggerProps) {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        startTransition(async () => {
            const result = await cancelExpiredOrders(userId);
            if (result.expiredCount > 0) {
                router.refresh();
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return null;
}