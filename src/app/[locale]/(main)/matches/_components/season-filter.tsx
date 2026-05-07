"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"

type Season = {
    id: string;
    slug: string;
    name: string;
};

type SeasonFilterProps = {
    seasons: Season[];
    currentSeasonSlug: string;
}

export default function SeasonFilter({ seasons, currentSeasonSlug }: SeasonFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("season", value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return (
        <div className="w-50">
            <Select value={currentSeasonSlug} onValueChange={handleChange}>
                <SelectTrigger className="w-full font-semibold border-border">
                    <SelectValue placeholder="Оберіть сезон" />
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
    );
}