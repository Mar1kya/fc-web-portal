"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"

export default function ProductSort() {
    const t = useTranslations("Shop.ProductSort");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSort = searchParams.get("sort") || "newest";

    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value === "newest") {
            params.delete("sort");
        } else {
            params.set("sort", value);
        }

        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="w-48"> 
            <Select value={currentSort} onValueChange={handleChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("title")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">{t("newest")}</SelectItem>
                    <SelectItem value="price_asc">{t("price_asc")}</SelectItem>
                    <SelectItem value="price_desc">{t("price_desc")}</SelectItem>
                    <SelectItem value="sale_first">{t("sale_first")}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}