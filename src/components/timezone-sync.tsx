"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TIMEZONE_COOKIE } from "@/lib/constants";

export default function TimezoneSync() {
    const router = useRouter();

    useEffect(() => {
        try {
            const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (!detectedTz) return;

            const cookieMatch = document.cookie.match(
                new RegExp(`(?:^|; )${TIMEZONE_COOKIE}=([^;]*)`)
            );
            const currentTz = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;

            if (currentTz !== detectedTz) {
                document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(detectedTz)}; path=/; max-age=31536000; SameSite=Lax`;
                router.refresh();
            }
        } catch {
        }
    }, [router]);

    return null;
}