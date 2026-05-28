"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

const STATUSES = ["ALL", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrderHistoryTabs() {
    const t = useTranslations("ProfilePage.History");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get("status") || "ALL";
    const currentSort = searchParams.get("sort") || "desc";

    function updateParams(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value === "ALL" && key === "status") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        params.delete("page");

        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Tabs value={currentStatus} onValueChange={(val) => updateParams("status", val)} className="w-full sm:w-auto overflow-hidden">
                <TabsList className="flex w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {STATUSES.map((status) => (
                        <TabsTrigger
                            key={status}
                            value={status}
                            className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            {t(`Tabs.${status}`)}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            <div className="w-full sm:w-30 pb-2 sm:pb-0">
                <Select value={currentSort} onValueChange={(val) => updateParams("sort", val)}>
                    <SelectTrigger className="w-full min-w-30">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="desc">{t("Sort.newest")}</SelectItem>
                        <SelectItem value="asc">{t("Sort.oldest")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}