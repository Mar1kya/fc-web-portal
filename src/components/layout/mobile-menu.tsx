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

const teamsData = [
    { slug: "main", name: "Основний склад" },
    { slug: "u19", name: "Команда U-19" },
    { slug: "academy", name: "Академія" },
]

const matchesMenuData = [
    {
        teamName: "Перша команда",
        matchesLink: "/matches/main",
        standings: [
            { name: "Турнірна таблиця УПЛ", link: "/standings/main/upl" },
            { name: "Турнірна таблиця ЛК", link: "/standings/main/conference-league" },
        ]
    },
    {
        teamName: "Юнацька команда",
        matchesLink: "/matches/u19",
        standings: [
            { name: "Турнірна таблиця U19", link: "/standings/u19/championship" },
        ]
    },
    {
        teamName: "Академія",
        matchesLink: "/matches/academy",
        standings: [
            { name: "Турнірна таблиця ДЮФЛ", link: "/standings/academy/dyufl" },
        ]
    }
]

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

export function MobileMenu() {
    const t = useTranslations("Header.DesktopMenu");
    const [isOpen, setIsOpen] = React.useState(false);

    const triggerClass = "text-base font-medium cursor-pointer hover:no-underline hover:text-emerald-600 [&[data-state=open]]:text-emerald-600 py-4";

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
                                <MobileLink href="/news" setIsOpen={setIsOpen}>{t("allNews")}</MobileLink>
                                <MobileLink href="/news?type=statement" setIsOpen={setIsOpen}>{t("officially")}</MobileLink>
                                <MobileLink href="/news?type=interview" setIsOpen={setIsOpen}>{t("interview")}</MobileLink>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="team">
                            <AccordionTrigger className={triggerClass}>
                                {t("team")}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-0 pl-4 pb-2">
                                {teamsData.map((team) => (
                                    <MobileLink key={`mob-team-${team.slug}`} href={`/team/${team.slug}`} setIsOpen={setIsOpen}>{team.name}</MobileLink>
                                ))}
                                <div className="h-px bg-border my-2 mr-4" />
                                <MobileLink href="/coaches" setIsOpen={setIsOpen}>{t("coaches")}</MobileLink>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="matches">
                            <AccordionTrigger className={triggerClass}>
                                {t("matches")}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-4 pl-4 pb-2">
                                {matchesMenuData.map((group, index) => (
                                    <div key={`mob-match-${index}`} className="flex flex-col gap-0">
                                        <MobileLink href={group.matchesLink} setIsOpen={setIsOpen} className="text-foreground font-medium pb-1 hover:text-emerald-600 transition-colors">
                                            {group.teamName}
                                        </MobileLink>
                                        {group.standings.map((standing, sIdx) => (
                                            <MobileLink key={`mob-stand-${index}-${sIdx}`} href={standing.link} setIsOpen={setIsOpen}>
                                                {standing.name}
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