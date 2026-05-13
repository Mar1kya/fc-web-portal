import { getTranslations } from "next-intl/server";
import { NavLink } from "../ui/nav-link";

export default async function ShopMenu() {
    const t = await getTranslations("Shop.Navigation");

    return (
        <div className="w-full 2xl:border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 px-2">
            <div className="container mx-auto border-b 2xl:border-0">
                <nav className="flex items-center justify-start lg:justify-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide py-3">
                    <NavLink
                        href="/shop"
                        exact={true}
                        activeClassName="text-emerald-600 border-b-2 border-emerald-600 pb-1"
                        className="text-sm md:text-base font-semibold uppercase tracking-wider hover:text-emerald-600"
                    >
                        {t("all")}
                    </NavLink>
                    <NavLink
                        href="/shop/kits"
                        exact={false}
                        activeClassName="text-emerald-600 border-b-2 border-emerald-600 pb-1"
                        className="text-sm md:text-base font-semibold uppercase tracking-wider hover:text-emerald-600"
                    >
                        {t("kits")}
                    </NavLink>
                    <NavLink
                        href="/shop/apparel"
                        exact={false}
                        activeClassName="text-emerald-600 border-b-2 border-emerald-600 pb-1"
                        className="text-sm md:text-base font-semibold uppercase tracking-wider hover:text-emerald-600"
                    >
                        {t("apparel")}
                    </NavLink>
                    <NavLink
                        href="/shop/accessories"
                        exact={false}
                        activeClassName="text-emerald-600 border-b-2 border-emerald-600 pb-1"
                        className="text-sm md:text-base font-semibold uppercase tracking-wider hover:text-emerald-600"
                    >
                        {t("accessories")}
                    </NavLink>
                    <NavLink
                        href="/shop/sale"
                        exact={false}
                        activeClassName="text-red-500 border-b-2 border-red-500 pb-1"
                        className="text-sm md:text-base font-bold uppercase tracking-wider hover:text-red-400 transition-colors"
                    >
                        {t("sale")} %
                    </NavLink>
                </nav>
            </div>
        </div>
    );
}