"use client"

import { useMemo } from "react" 
import { Calendar } from "@/components/ui/calendar"
import { useRouter, usePathname, Link } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { format, parse, isAfter, startOfDay, isValid } from "date-fns" 
import { uk, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"

export default function NewsCalendarFilter({ activeDates, minYear }: { activeDates: string[]; minYear: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const dateParam = searchParams.get("date");
    const parsedDate = dateParam ? parse(dateParam, "yyyy-MM-dd", new Date()) : undefined;
    const selectedDate = parsedDate && isValid(parsedDate) ? parsedDate : undefined;
    const activeDatesSet = useMemo(() => new Set(activeDates), [activeDates]);

    const createDateURL = (date: Date) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page"); 
        const dateStr = format(date, "yyyy-MM-dd");
        
        if (dateParam === dateStr) {
            params.delete("date");
        } else {
            params.set("date", dateStr);
        }
        
        return `${pathname}?${params.toString()}`;
    };

    function handleSelect(date: Date | undefined) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");

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
        return !activeDatesSet.has(dateStr);
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
                renderDay={(date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    if (!activeDatesSet.has(dateStr)) {
                        return (
                            <span className="flex h-full w-full items-center justify-center">
                                {date.getDate()}
                            </span>
                        );
                    }
                    return (
                        <Link 
                            href={createDateURL(date)} 
                            className="flex h-full w-full items-center justify-center"
                        >
                            {date.getDate()}
                        </Link>
                    );
                }}
            />
        </div>
    )
}