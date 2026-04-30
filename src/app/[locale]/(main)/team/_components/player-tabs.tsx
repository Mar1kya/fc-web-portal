"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"

type ProfileTabsProps = {
    bioContent: React.ReactNode;
    newsContent: React.ReactNode;
    mediaContent: React.ReactNode;
}

export default function ProfileTabs({ bioContent, newsContent, mediaContent }: ProfileTabsProps) {
    const t = useTranslations("ProfileTabs");

    return (
        <Tabs defaultValue="bio" className="w-full mt-12">
            <TabsList className="flex w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <TabsTrigger
                    value="bio"
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                    {t("bio")}
                </TabsTrigger>
                <TabsTrigger
                    value="news"
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                    {t("news")}
                </TabsTrigger>
                <TabsTrigger
                    value="media"
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                    {t("media")}
                </TabsTrigger>
            </TabsList>
            <div className="pt-8 min-h-75">
                <TabsContent value="bio" className="m-0 focus-visible:outline-none">
                    {bioContent}
                </TabsContent>
                <TabsContent value="news" className="m-0 focus-visible:outline-none">
                    {newsContent}
                </TabsContent>
                <TabsContent value="media" className="m-0 focus-visible:outline-none">
                    {mediaContent}
                </TabsContent>
            </div>
        </Tabs>
    )
}