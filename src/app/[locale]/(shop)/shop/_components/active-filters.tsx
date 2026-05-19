"use client"

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function ActiveFilters() {
    const t = useTranslations("Shop.Filters");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeFilters: { key: string, value: string, label: string }[] = [];

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
        let label = "";
        if (minPrice && maxPrice) label = `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
        else if (minPrice) label = `${t("from")} ${formatPrice(minPrice)}`;
        else if (maxPrice) label = `${t("to")} ${formatPrice(maxPrice)}`;

        activeFilters.push({ key: "price", value: "range", label });
    }

    ["demographic", "apparelType", "color", "size"].forEach((key) => {
        const values = searchParams.get(key)?.split(",") || [];
        values.forEach(val => {
            activeFilters.push({
                key,
                value: val,
                label: key === "size" ? val : t(`${key}.${val}`)
            });
        });
    });

    if (activeFilters.length === 0) return null;

    const removeFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (key === "price") {
            params.delete("minPrice");
            params.delete("maxPrice");
        } else {
            const currentValues = params.get(key)?.split(",") || [];
            const newValues = currentValues.filter(v => v !== value);
            if (newValues.length > 0) {
                params.set(key, newValues.join(","));
            } else {
                params.delete(key);
            }
        }

        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    const clearAll = () => {
        const sort = searchParams.get("sort");
        const params = new URLSearchParams();
        if (sort) params.set("sort", sort);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground mr-2">{t("title")}:</span>
            {activeFilters.map((filter) => (
                <button
                    key={`${filter.key}-${filter.value}`}
                    onClick={() => removeFilter(filter.key, filter.value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background text-sm font-medium transition-colors hover:bg-muted group"
                >
                    {filter.label}
                    <X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                </button>
            ))}
            <button
                onClick={clearAll}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 ml-2 transition-colors"
            >
                {t("clear")}
            </button>
        </div>
    );
}