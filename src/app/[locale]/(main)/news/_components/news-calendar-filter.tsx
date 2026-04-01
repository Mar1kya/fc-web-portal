"use client"

import { Calendar } from "@/components/ui/calendar"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { format, parse, isAfter, startOfDay } from "date-fns"
import { uk, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"

export default function NewsCalendarFilter({ activeDates, minYear }: { activeDates: string[]; minYear: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const dateParam = searchParams.get("date");
    const selectedDate = dateParam ? parse(dateParam, "yyyy-MM-dd", new Date()) : undefined;

    function handleSelect(date: Date | undefined) {
        const params = new URLSearchParams(searchParams.toString());
        if (date) {
            params.set("date", format(date, "yyyy-MM-dd"));
        } else {
            params.delete("date");
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    function disabledDays(date: Date) {
        if (isAfter(startOfDay(date), startOfDay(new Date()))) {
            return true;
        }
        const dateStr = format(date, "yyyy-MM-dd");
        return !activeDates.includes(dateStr);
    };
    const currentYear = new Date().getFullYear();
    const startMonth = new Date(minYear, 0);
    const endMonth = new Date(currentYear, 11);

    return (
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-3 shadow-sm">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelect}
                locale={locale === 'uk' ? uk : enUS}
                disabled={disabledDays}
                captionLayout="dropdown"
                startMonth={startMonth}
                endMonth={endMonth}
                className="w-full"
            />
        </div>
    )
}