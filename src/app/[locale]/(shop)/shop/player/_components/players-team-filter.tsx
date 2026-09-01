"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { TeamContext } from "../../../../../../../generated/prisma"

export default function PlayersTeamFilter({
    availableTeamContexts,
    defaultTeam,
}: {
    availableTeamContexts: TeamContext[];
    defaultTeam: TeamContext;
}) {
    const tEnums = useTranslations("Enums");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const teamParam = searchParams.get("team");

    const currentValue =
        teamParam && availableTeamContexts.includes(teamParam as TeamContext)
            ? teamParam
            : defaultTeam;

    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value === defaultTeam) {
            params.delete("team");
        } else {
            params.set("team", value);
        }

        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="w-37.5">
            <Select value={currentValue} onValueChange={handleChange}>
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {availableTeamContexts.map((team) => (
                        <SelectItem value={team} key={team}>
                            {tEnums(`TeamContext.${team}`)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}