"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Season = { id: string; name: string; isActive: boolean };

type SeasonFilterProps = {
    seasons: Season[];
    currentSeasonId?: string;
    includeAllOption?: boolean;
};

export function SeasonFilter({ seasons, currentSeasonId, includeAllOption = false }: SeasonFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "ALL") params.delete("season");
        else params.set("season", value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Select value={currentSeasonId ?? "ALL"} onValueChange={handleChange}>
            <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Оберіть сезон" />
            </SelectTrigger>
            <SelectContent>
                {includeAllOption && <SelectItem value="ALL">Усі сезони</SelectItem>}
                {seasons.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                        {s.name}{s.isActive ? " (поточний)" : ""}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}