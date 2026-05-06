"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import { Menu } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { PostType, TeamContext } from "../../../generated/prisma"

type MatchesMenuType = {
    context: string;
    matchesLink: string;
    standings: { name: string; link: string }[];
};
type MobileLinkProps = {
    href: string;
    children: React.ReactNode;
    className?: string;
    setIsOpen: (isOpen: boolean) => void;
}

const MobileLink = ({ href, children, className, setIsOpen }: MobileLinkProps) => (
    <Link
        href={href}
        onClick={() => setIsOpen(false)}
        className={cn(
            "block py-2.5 text-sm transition-colors text-muted-foreground hover:text-emerald-600 hover:no-underline",
            className
        )}
    >
        {children}
    </Link>
);

export default function MobileMenu({ activeTeamContexts, matchesMenuData }: { activeTeamContexts: string[]; matchesMenuData: MatchesMenuType[] }) {
    const t = useTranslations("Header.DesktopMenu");
    const tEnums = useTranslations("Enums");
    const [isOpen, setIsOpen] = React.useState(false);
    const triggerClass = "text-base font-medium cursor-pointer hover:no-underline hover:text-emerald-600 [&[data-state=open]]:text-emerald-600 py-4";
    const postTypes = Object.values(PostType);
    const allTeamContexts = Object.values(TeamContext);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="lg:hidden p-2 hover:bg-accent hover:text-emerald-600 rounded-md transition-colors cursor-pointer">
                <Menu className="w-6 h-6" />
                <span className="sr-only">{t("button")}</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-70 sm:w-[320px] overflow-y-auto p-4">
                <SheetHeader className="text-left mb-2 border-b pb-4 mt-6 px-0">
                    <SheetTitle className="text-xl font-extrabold uppercase text-emerald-600">
                        Emerald Gang
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="news">
                            <AccordionTrigger className={triggerClass}>
                                {t("news")}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-0 pl-4 pb-2">
                                <MobileLink href="/news" setIsOpen={setIsOpen}>
                                    {t("allNews")}
                                </MobileLink>
                                <div className="h-px bg-border my-2 mr-4" />
                                {postTypes.map((type) => (
                                    <MobileLink
                                        key={`mob-news-type-${type}`}
                                        href={`/news?type=${type}`}
                                        setIsOpen={setIsOpen}
                                    >
                                        {tEnums(`PostType.${type}`)}
                                    </MobileLink>
                                ))}
                                <div className="h-px bg-border my-2 mr-4" />
                                {allTeamContexts.map((team) => (
                                    <MobileLink
                                        key={`mob-news-team-${team}`}
                                        href={`/news?team=${team}`}
                                        setIsOpen={setIsOpen}
                                    >
                                        {tEnums(`TeamContext.${team}`)}
                                    </MobileLink>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="team">
                            <AccordionTrigger className={triggerClass}>
                                {t("team")}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-0 pl-4 pb-2">
                                {activeTeamContexts.map((teamContext) => (
                                    <MobileLink
                                        key={`mob-team-${teamContext}`}
                                        href={`/team?context=${teamContext}`}
                                        setIsOpen={setIsOpen}
                                    >
                                        {tEnums(`TeamContext.${teamContext}`)}
                                    </MobileLink>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="matches">
                            <AccordionTrigger className={triggerClass}>
                                {t("matches")}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-4 pl-4 pb-2">
                                {matchesMenuData.map((group, _index) => (
                                    <div key={`mob-match-${group.context}`} className="flex flex-col gap-0">
                                        <MobileLink href={group.matchesLink} setIsOpen={setIsOpen} className="text-foreground font-medium pb-1 hover:text-emerald-600 transition-colors">
                                            {tEnums(`TeamContext.${group.context}`)}
                                        </MobileLink>

                                        {group.standings.map((standing, sIdx) => (
                                            <MobileLink key={`mob-stand-${group.context}-${sIdx}`} href={standing.link} setIsOpen={setIsOpen}>
                                                {`${t("standingsTablePrefix")} ${standing.name}`}
                                            </MobileLink>
                                        ))}
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="club" className="border-b">
                            <AccordionTrigger className={triggerClass}>
                                {t("club")}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-0 pl-4 pb-2">
                                <MobileLink href="/club/history" setIsOpen={setIsOpen}>{t("history")}</MobileLink>
                                <MobileLink href="/club/stadium" setIsOpen={setIsOpen}>{t("stadium")}</MobileLink>
                                <MobileLink href="/club/contacts" setIsOpen={setIsOpen}>{t("contacts")}</MobileLink>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <div className="border-b">
                        <Link
                            href="/shop"
                            onClick={() => setIsOpen(false)}
                            className="flex w-full items-center py-4 text-base font-medium transition-colors hover:text-emerald-600 hover:no-underline cursor-pointer"
                        >
                            {t("shop")}
                        </Link>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}