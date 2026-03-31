"use client"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { routing } from "@/i18n/routing";
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

export default function SelectLanguage({ className }: { className?: string }) {
    const currentLocale = useLocale();
    const locales = routing.locales;
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams(); 
    const [isPending, startTransition] = useTransition();

    function handleChange(nextLocale: string) {
        startTransition(() => {
            const paramsString = searchParams.toString();
            const href = paramsString ? `${pathname}?${paramsString}` : pathname;

            router.replace(href, { locale: nextLocale });
        })
    }

    return (
        <div className={cn("inline-block", className)}>
            <Select
                value={currentLocale}
                onValueChange={handleChange}
                disabled={isPending}
            >
                <SelectTrigger className="w-16">
                    <SelectValue placeholder={currentLocale.toUpperCase()} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {locales.map((locale) => (
                            <SelectItem value={locale} key={locale}>
                                {locale.toUpperCase()}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}