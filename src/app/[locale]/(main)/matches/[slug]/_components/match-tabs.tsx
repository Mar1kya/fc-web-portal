"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"

type MatchTabsProps = {
    lineupsContent: React.ReactNode;
    newsContent: React.ReactNode;
    photosContent: React.ReactNode;
    videosContent: React.ReactNode;
}

export default function MatchTabs({ lineupsContent, newsContent, photosContent, videosContent }: MatchTabsProps) {
    const t = useTranslations("SingleMatchPage.Tabs");

    return (
        <Tabs defaultValue="lineups" className="w-full mt-12">
            <TabsList className="flex w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <TabsTrigger
                    value="lineups"
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                    {t("lineups")}
                </TabsTrigger>
                <TabsTrigger
                    value="news"
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                    {t("news")}
                </TabsTrigger>
                <TabsTrigger
                    value="photos"
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                    {t("photos")}
                </TabsTrigger>
                <TabsTrigger
                    value="videos"
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                    {t("videos")}
                </TabsTrigger>
            </TabsList>
            <div className="pt-8 min-h-75">
                <TabsContent value="lineups" className="m-0 focus-visible:outline-none">
                    {lineupsContent}
                </TabsContent>
                <TabsContent value="news" className="m-0 focus-visible:outline-none">
                    {newsContent}
                </TabsContent>
                <TabsContent value="photos" className="m-0 focus-visible:outline-none">
                    {photosContent}
                </TabsContent>
                <TabsContent value="videos" className="m-0 focus-visible:outline-none">
                    {videosContent}
                </TabsContent>
            </div>
        </Tabs>
    )
}