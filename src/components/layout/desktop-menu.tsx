"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { PostType, TeamContext } from "../../../generated/prisma"

export type MatchesMenuType = {
    context: string;
    matchesLink: string;
    standings: { name: string; link: string }[];
};

const MenuItem = ({ href, title, className }: { href: string; title: string; className?: string }) => (
    <li>
        <Link
            href={href}
            className={cn(
                "block rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                className
            )}
        >
            {title}
        </Link>
    </li>
)



export default function DesktopMenu({ activeTeamContexts, matchesMenuData }: { activeTeamContexts: string[]; matchesMenuData: MatchesMenuType[] }) {
    const t = useTranslations("Header.DesktopMenu");
    const tEnums = useTranslations("Enums");
    const postTypes = Object.values(PostType);
    const allTeamContexts = Object.values(TeamContext);
    return (
        <div className="hidden lg:flex w-full justify-center">
            <ul className="flex items-center gap-8">
                <li className="group relative py-4">
                    <Link href="/news" className="flex items-center gap-1 font-semibold transition-colors hover:text-emerald-600">
                        {t("news")}  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                    </Link>
                    <ul className="absolute left-0 top-full hidden w-56 flex-col gap-1 rounded-md border border-border/50 bg-background/95 backdrop-blur-md p-2 shadow-lg group-hover:flex animate-in fade-in zoom-in-95 duration-200">
                        <MenuItem href="/news" title={t("allNews")} className="font-semibold text-foreground" />

                        <div className="my-1 h-px bg-border/50" />
                        {postTypes.map((type) => (
                            <MenuItem
                                key={`desk-news-type-${type}`}
                                href={`/news?type=${type}`}
                                title={tEnums(`PostType.${type}`)}
                            />
                        ))}

                        <div className="my-1 h-px bg-border/50" />
                        {allTeamContexts.map((team) => (
                            <MenuItem
                                key={`desk-news-team-${team}`}
                                href={`/news?team=${team}`}
                                title={tEnums(`TeamContext.${team}`)}
                            />
                        ))}
                    </ul>
                </li>
                <li className="group relative py-4">
                    <Link href="/team" className="flex items-center gap-1 font-semibold transition-colors hover:text-emerald-600">
                        {t("team")} <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                    </Link>
                    <ul className="absolute left-0 top-full hidden w-55 flex-col gap-1 rounded-md border border-border/50 bg-background/95 backdrop-blur-md p-2 shadow-lg group-hover:flex animate-in fade-in zoom-in-95 duration-200">
                        {activeTeamContexts.map((teamContext) => (
                            <MenuItem
                                key={`team-menu-${teamContext}`}
                                href={`/team?context=${teamContext}`}
                                title={tEnums(`TeamContext.${teamContext}`)}
                            />
                        ))}

                    </ul>
                </li>
                <li className="group relative py-4">
                    <Link href="/matches" className="flex items-center gap-1 font-semibold transition-colors hover:text-emerald-600">
                        {t("matches")} <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                    </Link>
                    <ul className="absolute left-0 top-full hidden w-70 flex-col gap-1 rounded-md border border-border/50 bg-background/95 backdrop-blur-md p-2 shadow-lg group-hover:flex animate-in fade-in zoom-in-95 duration-200">
                        {matchesMenuData.map((group, index) => (
                            <React.Fragment key={`match-group-${group.context}`}>
                                <MenuItem
                                    href={group.matchesLink}
                                    title={tEnums(`TeamContext.${group.context}`)}
                                    className="font-semibold"
                                />

                                {group.standings.map((standing, sIdx) => (
                                    <MenuItem
                                        key={`standing-${group.context}-${sIdx}`}
                                        href={standing.link}
                                        title={`${t("standingsTablePrefix")} ${standing.name}`}
                                        className="text-muted-foreground"
                                    />
                                ))}
                                {index < matchesMenuData.length - 1 && (
                                    <div className="my-1 h-px bg-border/50 w-full" />
                                )}
                            </React.Fragment>
                        ))}

                    </ul>
                </li>
                <li className="py-4">
                    <Link href="/shop" className="font-semibold transition-colors hover:text-emerald-600">
                        {t("shop")}
                    </Link>
                </li>
                <li className="group relative py-4">
                    <Link href="/club" className="flex items-center gap-1 font-semibold transition-colors hover:text-emerald-600">
                        {t("club")} <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                    </Link>
                    <ul className="absolute left-0 top-full hidden w-50 flex-col gap-1 rounded-md border border-border/50 bg-background/95 backdrop-blur-md p-2 shadow-lg group-hover:flex animate-in fade-in zoom-in-95 duration-200">
                        <MenuItem href="/club/history" title={t("history")} />
                        <MenuItem href="/club/stadium" title={t("stadium")} />
                        <MenuItem href="/club/contacts" title={t("contacts")} />
                    </ul>
                </li>
            </ul>
        </div>
    )
}