"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"

type Season = {
    id: string;
    slug: string;
    name: string;
};

type SeasonSelectorProps = {
    seasons: Season[];
    currentSeasonSlug: string;
}

export default function SeasonFilters({ seasons, currentSeasonSlug }: SeasonSelectorProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set("season", value);
        } else {
            params.delete("season");
        }

        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="w-48">
            <Select value={currentSeasonSlug} onValueChange={handleChange}>
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {seasons.map((season) => (
                        <SelectItem value={season.slug} key={season.id}>
                            {season.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}