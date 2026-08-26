"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalyticsPeriod, PERIOD_OPTIONS } from "@/lib/analytics/period"

type PeriodSwitcherProps = {
    value: AnalyticsPeriod
}

export function PeriodSwitcher({ value }: PeriodSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    function handleChange(next: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("period", next)
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="w-45">
                <SelectValue placeholder="Період" />
            </SelectTrigger>
            <SelectContent>
                {PERIOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}