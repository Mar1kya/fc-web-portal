"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import FilterSection from "./filter-section";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { formatPrice, getCurrencySymbol } from "@/lib/utils";

type ShopSidebarProps = {
    availableFilters: { demographics: string[], colors: string[], apparelTypes: string[], sizes: string[], absoluteMinPrice: number, absoluteMaxPrice: number };
    dynamicFilters: { demographics: string[], colors: string[], apparelTypes: string[], sizes: string[] };
}

export default function ShopSidebar({ availableFilters, dynamicFilters }: ShopSidebarProps) {
    const t = useTranslations("Shop.Filters");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { absoluteMinPrice, absoluteMaxPrice } = availableFilters;
    const currencySymbol = getCurrencySymbol();

    const currentMinParam = searchParams.get("minPrice");
    const currentMaxParam = searchParams.get("maxPrice");

    const [priceRange, setPriceRange] = useState([
        currentMinParam ? Number(currentMinParam) : absoluteMinPrice,
        currentMaxParam ? Number(currentMaxParam) : absoluteMaxPrice
    ]);

    const [inputMin, setInputMin] = useState(priceRange[0].toString());
    const [inputMax, setInputMax] = useState(priceRange[1].toString());

    useEffect(() => {
        const newMin = currentMinParam ? Number(currentMinParam) : absoluteMinPrice;
        const newMax = currentMaxParam ? Number(currentMaxParam) : absoluteMaxPrice;

        if (priceRange[0] !== newMin || priceRange[1] !== newMax) {
            setPriceRange([newMin, newMax]);
            setInputMin(newMin.toString());
            setInputMax(newMax.toString());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMinParam, currentMaxParam, absoluteMinPrice, absoluteMaxPrice]);

    const updateUrlWithPrice = (min: number, max: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (min > absoluteMinPrice) params.set("minPrice", min.toString());
        else params.delete("minPrice");

        if (max < absoluteMaxPrice) params.set("maxPrice", max.toString());
        else params.delete("maxPrice");

        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSliderChange = (value: number[]) => {
        setPriceRange(value);
        setInputMin(value[0].toString());
        setInputMax(value[1].toString());
    };

    const handleInputBlur = () => {
        let min = Number(inputMin);
        let max = Number(inputMax);

        if (min < absoluteMinPrice) min = absoluteMinPrice;
        if (max > absoluteMaxPrice) max = absoluteMaxPrice;
        if (min > max) {
            const temp = min;
            min = max;
            max = temp;
        }

        setInputMin(min.toString());
        setInputMax(max.toString());
        setPriceRange([min, max]);
        updateUrlWithPrice(min, max);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const toggleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentValues = params.get(key)?.split(",") || [];

        if (currentValues.includes(value)) {
            const newValues = currentValues.filter(v => v !== value);
            if (newValues.length > 0) params.set(key, newValues.join(","));
            else params.delete(key);
        } else {
            currentValues.push(value);
            params.set(key, currentValues.join(","));
        }
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    const isActive = (key: string, value: string) => (searchParams.get(key)?.split(",") || []).includes(value);

    return (
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold uppercase tracking-tight hidden lg:block">{t("title")}</h2>
            </div>
            <Accordion
                type="multiple"
                defaultValue={["price", "demographics", "apparelTypes", "sizes", "colors"]}
                className="w-full"
            >
                <AccordionItem value="price">
                    <AccordionTrigger className="text-sm font-semibold uppercase tracking-tight hover:no-underline py-3">
                        {t("price")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                        <div className="flex flex-col gap-5 px-1">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        type="number"
                                        value={inputMin}
                                        onChange={(e) => setInputMin(e.target.value)}
                                        onBlur={handleInputBlur}
                                        onKeyDown={handleKeyDown}
                                        className="h-10 pr-8 bg-muted/50 font-medium"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{currencySymbol}</span>
                                </div>
                                <span className="text-muted-foreground">-</span>
                                <div className="relative flex-1">
                                    <Input
                                        type="number"
                                        value={inputMax}
                                        onChange={(e) => setInputMax(e.target.value)}
                                        onBlur={handleInputBlur}
                                        onKeyDown={handleKeyDown}
                                        className="h-10 pr-8 bg-muted/50 font-medium"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{currencySymbol}</span>
                                </div>
                            </div>
                            <div className="px-1 mt-2">
                                <Slider
                                    min={absoluteMinPrice}
                                    max={absoluteMaxPrice}
                                    step={10}
                                    value={priceRange}
                                    onValueChange={handleSliderChange}
                                    onValueCommit={() => updateUrlWithPrice(priceRange[0], priceRange[1])}
                                    className="cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatPrice(absoluteMinPrice)}</span>
                                <span>{formatPrice(absoluteMaxPrice)}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                {availableFilters.demographics.length > 0 && (
                    <AccordionItem value="demographics">
                        <AccordionTrigger className="text-sm font-semibold uppercase tracking-tight hover:no-underline py-4">
                            {t("demographicTitle")}
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-4">
                            <FilterSection title="" items={availableFilters.demographics} dynamicItems={dynamicFilters.demographics} filterKey="demographic" isActive={isActive} toggleFilter={toggleFilter} t={t} />
                        </AccordionContent>
                    </AccordionItem>
                )}
                {availableFilters.apparelTypes.length > 0 && (
                    <AccordionItem value="apparelTypes">
                        <AccordionTrigger className="text-sm font-semibold uppercase tracking-tight hover:no-underline py-4">
                            {t("apparelTypeTitle")}
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-4">
                            <FilterSection title="" items={availableFilters.apparelTypes} dynamicItems={dynamicFilters.apparelTypes} filterKey="apparelType" isActive={isActive} toggleFilter={toggleFilter} t={t} />
                        </AccordionContent>
                    </AccordionItem>
                )}
                {availableFilters.sizes.length > 0 && (
                    <AccordionItem value="sizes">
                        <AccordionTrigger className="text-sm font-semibold uppercase tracking-tight hover:no-underline py-4">
                            {t("sizeTitle")}
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-4">
                            <FilterSection title="" items={availableFilters.sizes} dynamicItems={dynamicFilters.sizes} filterKey="size" isActive={isActive} toggleFilter={toggleFilter} t={t} translateItems={false} />
                        </AccordionContent>
                    </AccordionItem>
                )}
                {availableFilters.colors.length > 0 && (
                    <AccordionItem value="colors">
                        <AccordionTrigger className="text-sm font-semibold uppercase tracking-tight hover:no-underline py-4">
                            {t("colorTitle")}
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-4">
                            <FilterSection title="" items={availableFilters.colors} dynamicItems={dynamicFilters.colors} filterKey="color" isActive={isActive} toggleFilter={toggleFilter} t={t} />
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </aside>
    );
}