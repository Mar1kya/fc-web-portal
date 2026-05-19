"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterSectionProps ={
    title: string;
    items: string[];
    dynamicItems: string[];
    filterKey: string;
    isActive: (key: string, value: string) => boolean;
    toggleFilter: (key: string, value: string) => void;
    t: (key: string) => string;
    translateItems?: boolean; 
}

export default function FilterSection({ title, items, dynamicItems, filterKey, isActive, toggleFilter, t, translateItems = true }: FilterSectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            {title && <h3 className="text-sm font-semibold uppercase tracking-tight">{title}</h3>}
            <div className="flex flex-col gap-3">
                {items.map((item) => {
                    const active = isActive(filterKey, item);
                    const isDisabled = !active && !dynamicItems.includes(item);

                    return (
                        <label 
                            key={item} 
                            className={cn(
                                "flex items-center gap-3 group",
                                isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                            )}
                        >
                            <input 
                                type="checkbox" 
                                className="peer hidden" 
                                checked={active}
                                disabled={isDisabled}
                                onChange={() => toggleFilter(filterKey, item)}
                            />
                            <div className={cn(
                                "h-4 w-4 shrink-0 rounded-sm border ring-offset-background flex items-center justify-center transition-colors",
                                active ? "bg-emerald-600 border-emerald-600 text-white" : "border-input",
                                !isDisabled && !active && "group-hover:border-emerald-500",
                                isDisabled && "bg-muted"
                            )}>
                                {active && <Check className="h-3 w-3" strokeWidth={3} />}
                            </div>
                            
                            <span className={cn(
                                "text-sm font-medium leading-none transition-colors",
                                active ? "text-foreground" : "text-muted-foreground",
                                !isDisabled && !active && "group-hover:text-foreground"
                            )}>
                                {translateItems ? t(`${filterKey}.${item}`) : item}
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}