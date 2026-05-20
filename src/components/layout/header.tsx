import { Link } from "@/i18n/navigation";
import SelectLanguage from "./select-language";
import { auth } from "@/auth";
import { ShoppingBasket } from "lucide-react";
import UserMenu from "./user-menu";
import DesktopMenu from "./desktop-menu";
import MobileMenu from "./mobile-menu";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { TeamContext } from "../../../generated/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import CartMenu from "./cart-menu";

export default async function Header() {
    const session = await auth();
    const locale = await getLocale();
    let user = session?.user
    if (user?.email) {
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { name: true, email: true, image: true }
        });

        if (dbUser) {
            user = { ...user, ...dbUser };
        }
    }
    const t = await getTranslations("Header");
    const activeTeamsDb = await prisma.player.groupBy({
        by: ['teamContext'],
    });
    const activeTeamContexts = activeTeamsDb.length > 0
        ? activeTeamsDb.map(t => t.teamContext)
        : [TeamContext.MAIN_TEAM];

    const matchesContextsDb = await prisma.match.groupBy({
        by: ['teamContext'],
    });
    const contextsWithMatches = matchesContextsDb.map(m => m.teamContext);

    const standingsContextsDb = await prisma.standing.findMany({
        distinct: ['teamContext', 'tournamentId'],
        select: {
            teamContext: true,
            tournament: {
                include: { translations: true }
            }
        }
    });

    const activeMatchContextsSet = new Set([
        ...contextsWithMatches,
        ...standingsContextsDb.map(s => s.teamContext)
    ]);

    const orderedMatchContexts = Object.values(TeamContext).filter(c => activeMatchContextsSet.has(c));

    const dynamicMatchesMenu = orderedMatchContexts.map(context => {
        const standingsForContext = standingsContextsDb
            .filter(s => s.teamContext === context && s.tournament)
            .map(s => {
                const translatedTourName = getTranslation(s.tournament!, locale)?.name || s.tournament!.slug;
                return {
                    name: translatedTourName,
                    link: `/standings/${s.tournament!.slug}`
                }
            });

        return {
            context: context,
            matchesLink: `/matches?context=${context}`,
            standings: standingsForContext
        }
    });
    return <header className="sticky top-0 z-50 2xl:border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 px-2">
        <div className="container mx-auto border-0 lg:border-b 2xl:border-0">
            <div className="flex items-center justify-between border-b py-4">
                <div className="flex items-center gap-2 md:gap-4">
                    <Link href="/" className="hover:text-emerald-600 transition-colors">
                        <span className="text-xl font-extrabold uppercase hidden sm:block">
                            Emerald Gang
                        </span>
                        <span className="text-2xl font-extrabold uppercase sm:hidden">
                            EG
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <nav>
                        <ul className="flex items-center gap-3 sm:gap-4">
                            {user ? (
                                <>
                                    <li>
                                        {user.role === 'ADMIN' ? null : <CartMenu />}
                                    </li>
                                    <li className="flex items-center h-full">
                                        <UserMenu user={user} />
                                    </li>
                                </>
                            ) : (
                                <Link href="/login" className="text-sm font-medium hover:text-emerald-600 transition-colors">{t("login")}</Link>
                            )}
                        </ul>
                    </nav>
                    <SelectLanguage />
                    <MobileMenu
                        activeTeamContexts={activeTeamContexts}
                        matchesMenuData={dynamicMatchesMenu}
                    />
                </div>
            </div>
            <DesktopMenu
                activeTeamContexts={activeTeamContexts}
                matchesMenuData={dynamicMatchesMenu}
            />
        </div>
    </header>
}