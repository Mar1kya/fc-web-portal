import { Link } from "@/i18n/navigation";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SelectLanguage from "./select-language";
import { getLocale, getTranslations } from "next-intl/server";
import { TeamContext } from "../../../generated/prisma";
import { prisma } from "@/lib/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import React from "react";

const socialMediaLinks = [
    { icon: Facebook, link: "#", title: "Facebook" },
    { icon: Twitter, link: "#", title: "Twitter" },
    { icon: Instagram, link: "#", title: "Instagram" },
];

export default async function Footer() {
    const locale = await getLocale();
    const t = await getTranslations("Footer");
    const tEnums = await getTranslations("Enums");

    const activeTeamsDb = await prisma.player.groupBy({
        by: ['teamContext'],
    });
    const activeTeamContextsSet = new Set(
        activeTeamsDb.length > 0
            ? activeTeamsDb.map(t => t.teamContext)
            : [TeamContext.MAIN_TEAM]
    );

    const matchesContextsDb = await prisma.match.groupBy({
        by: ['teamContext'],
    });
    const matchContextsSet = new Set(matchesContextsDb.map(m => m.teamContext));

    const standingsDb = await prisma.standing.findMany({
        distinct: ['tournamentSeasonId'],
        select: {
            tournamentSeason: {
                select: {
                    tournament: {
                        include: { translations: true }
                    }
                }
            }
        }
    });

    const standingContextsSet = new Set(
        standingsDb.map(s => s.tournamentSeason.tournament.teamContext)
    );

    const coachesDb = await prisma.coach.groupBy({
        by: ['teamContext'],
    });
    const coachContextsSet = new Set(coachesDb.map(c => c.teamContext));

    const allRelevantContexts = new Set([
        ...activeTeamContextsSet,
        ...matchContextsSet,
        ...standingContextsSet,
        ...coachContextsSet,
    ]);
    const orderedContexts = Object.values(TeamContext).filter(c => allRelevantContexts.has(c));

    return (
        <footer className="pb-8 2xl:border-t px-2">
            <div className="container mx-auto space-y-12 2xl:border-0 border-t pt-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12">
                    <div className="flex flex-col items-center lg:items-start space-y-4 text-center lg:text-left">
                        <Link href="/" className="inline-block transition-colors hover:opacity-80">
                            <span className="text-2xl font-extrabold uppercase transition-colors hover:text-emerald-600 tracking-wider">
                                EG
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            {t("description")}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:col-span-2">
                        <div className="text-center lg:text-left">
                            <h3 className="mb-5 text-sm font-bold text-foreground uppercase tracking-wider">
                                {t("club")}
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/news" className="text-muted-foreground text-sm transition-colors hover:text-emerald-600 hover:underline underline-offset-4">
                                        {t("news")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/club/history" className="text-muted-foreground text-sm transition-colors hover:text-emerald-600 hover:underline underline-offset-4">
                                        {t("history")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/club/galleries" className="text-muted-foreground text-sm transition-colors hover:text-emerald-600 hover:underline underline-offset-4">
                                        {t("galleries")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/club/stadium" className="text-muted-foreground text-sm transition-colors hover:text-emerald-600 hover:underline underline-offset-4">
                                        {t("stadium")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/club/contacts" className="text-muted-foreground text-sm transition-colors hover:text-emerald-600 hover:underline underline-offset-4">
                                        {t("contacts")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/shop" className="text-muted-foreground text-sm transition-colors hover:text-emerald-600 hover:underline underline-offset-4">
                                        {t("shop")}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="text-center lg:text-left">
                            <h3 className="mb-5 text-sm font-bold text-foreground uppercase tracking-wider">
                                {t("team")}
                            </h3>
                            <ul className="space-y-3">
                                {orderedContexts.map((context) => {
                                    const contextLabel = tEnums(`TeamContext.${context}`);
                                    const tournamentStandings = Array.from(
                                        new Map(
                                            standingsDb
                                                .filter(s => s.tournamentSeason.tournament.teamContext === context)
                                                .map(s => [
                                                    s.tournamentSeason.tournament.id,
                                                    {
                                                        slug: s.tournamentSeason.tournament.slug,
                                                        name: getTranslation(s.tournamentSeason.tournament, locale)?.name || s.tournamentSeason.tournament.slug,
                                                        id: s.tournamentSeason.tournament.id,
                                                    }
                                                ])
                                        ).values()
                                    );

                                    return (
                                        <React.Fragment key={`footer-context-${context}`}>
                                            {activeTeamContextsSet.has(context) && (
                                                <li>
                                                    <Link href={`/team?context=${context}`} className="text-muted-foreground text-sm transition-colors hover:text-emerald-600 hover:underline underline-offset-4">
                                                        {contextLabel}
                                                    </Link>
                                                </li>
                                            )}
                                            {coachContextsSet.has(context) && (
                                                <li>
                                                    <Link href={`/team?context=${context}&pos=COACH`} className="text-muted-foreground text-sm transition-colors hover:text-emerald-600 hover:underline underline-offset-4">
                                                        {t("coaches")} {contextLabel}
                                                    </Link>
                                                </li>
                                            )}
                                            {tournamentStandings.map((tour) => (
                                                <li key={`footer-standing-${tour.id}`}>
                                                    <Link href={`/standings/${tour.slug}`} className="text-muted-foreground text-sm transition-colors hover:text-emerald-600 hover:underline underline-offset-4">
                                                        {t("standingsTablePrefix")} {tour.name}
                                                    </Link>
                                                </li>
                                            ))}
                                            {matchContextsSet.has(context) && (
                                                <li>
                                                    <Link href={`/matches?context=${context}`} className="text-muted-foreground text-sm transition-colors hover:text-emerald-600 hover:underline underline-offset-4">
                                                        {t("matches")} {contextLabel}
                                                    </Link>
                                                </li>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                        <div className="text-center sm:text-left">
                            <h3 className="mb-5 text-sm font-bold text-foreground uppercase tracking-wider text-center lg:text-left">
                                {t("contactUs")}
                            </h3>
                            <div className="space-y-6">
                                <ul className="space-y-3">
                                    <li className="flex items-center justify-start gap-3 text-sm text-muted-foreground">
                                        <Mail className="size-4 shrink-0 text-emerald-600" />
                                        <div>
                                            <a href="mailto:info@emeraldgang.com" className="hover:text-emerald-600 hover:underline underline-offset-4 transition-colors">
                                                info@emeraldgang.com
                                            </a>
                                        </div>
                                    </li>
                                    <li className="flex items-center justify-start gap-3 text-sm text-muted-foreground">
                                        <Phone className="size-4 shrink-0 text-emerald-600" />
                                        <div>
                                            <a href="tel:+380412510312" className="hover:text-emerald-600 hover:underline underline-offset-4 transition-colors">
                                                +38 (0412) 51-03-12
                                            </a>
                                        </div>
                                    </li>
                                    <li className="flex items-center justify-start gap-3 text-sm text-muted-foreground">
                                        <MapPin className="size-4 shrink-0 text-emerald-600" />

                                        <a href="https://maps.google.com/?q=Житомир,Україна"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-emerald-600 hover:underline underline-offset-4 transition-colors"
                                        >
                                            {t("location")}
                                        </a>
                                    </li>
                                </ul>
                                <ul className="flex flex-wrap justify-center lg:justify-start gap-3">
                                    {socialMediaLinks.map((social) => (
                                        <li key={social.title}>
                                            <Button size="icon" variant="outline" className="rounded-full hover:border-emerald-600 hover:text-emerald-600 hover:bg-emerald-600/10 transition-colors" asChild>
                                                <Link href={social.link} aria-label={social.title}>
                                                    <social.icon className="size-4" />
                                                </Link>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="flex flex-col-reverse items-center justify-between gap-6 md:flex-row">
                    <p className="text-muted-foreground text-xs sm:text-sm text-center md:text-left">
                        © {new Date().getFullYear()} Emerald Gang. {t("reserved")}.
                    </p>
                    <div className="flex items-center justify-center">
                        <SelectLanguage />
                    </div>
                </div>
            </div>
        </footer>
    );
}