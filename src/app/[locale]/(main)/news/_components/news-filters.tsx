"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { PostType, TeamContext } from "../../../../../../generated/prisma"

export default function NewsFilters() {
    const t = useTranslations("NewsPage");
    const tEnums = useTranslations("Enums");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get("type");
    const teamParam = searchParams.get("team");

    let currentValue = "all";
    if (teamParam) {
        currentValue = `team_${teamParam}`;
    } else if (typeParam) {
        currentValue = `type_${typeParam}`;
    }
    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());

        params.delete("type");
        params.delete("team");
        params.delete("page");
        
        if (value.startsWith("type_")) {
            params.set("type", value.replace("type_", ""));
        } else if (value.startsWith("team_")) {
            params.set("team", value.replace("team_", ""));
        }

        router.push(`${pathname}?${params.toString()}`);
    }
    const postTypes = Object.values(PostType);
    const teamContexts = Object.values(TeamContext);

    return (
        <div className="w-37.5">
            <Select value={currentValue} onValueChange={handleChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("allNews")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        {t("allNews")}
                    </SelectItem>
                    {teamContexts.map((team) => (
                        <SelectItem value={`team_${team}`} key={`team_${team}`}>
                            {tEnums(`TeamContext.${team}`)}
                        </SelectItem>
                    ))}
                    {postTypes.map((type) => (
                        <SelectItem value={`type_${type}`} key={`type_${type}`}>
                            {tEnums(`PostType.${type}`)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}