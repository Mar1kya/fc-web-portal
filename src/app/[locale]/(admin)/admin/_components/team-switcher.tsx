"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeamContext } from "../../../../../../generated/prisma"
import { TEAM_SWITCHER_OPTIONS } from "@/lib/utils/team-context"

type TeamSwitcherProps = {
    value: TeamContext
}

export function TeamSwitcher({ value }: TeamSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    function handleChange(next: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("team", next)
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="w-45">
                <SelectValue placeholder="Команда" />
            </SelectTrigger>
            <SelectContent>
                {TEAM_SWITCHER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}