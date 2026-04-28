"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { PlayerPosition } from "../../../../../../generated/prisma"

export default function TeamTabs() {
    const t = useTranslations("TeamPage");
    const tEnums = useTranslations("Enums");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPos = searchParams.get("pos") || "all";

    function handleTabChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value === "all") {
            params.delete("pos");
        } else {
            params.set("pos", value);
        }

        router.push(`${pathname}?${params.toString()}`);
    }
    const positions = Object.values(PlayerPosition);

    return (
        <Tabs value={currentPos} onValueChange={handleTabChange} className="w-full">
            <TabsList className="flex w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <TabsTrigger
                    value="all"
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                    {t("all")}
                </TabsTrigger>
                {positions.map((pos) => (
                    <TabsTrigger
                        key={pos}
                        value={pos}
                        className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                    >
                        {tEnums(`PlayerPosition.${pos}`)}
                    </TabsTrigger>
                ))}
                <TabsTrigger
                    value="COACH"
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                    {t("coaches")}
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}