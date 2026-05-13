import { getLocale, getTranslations } from "next-intl/server";
import { NavLink } from "../ui/nav-link";
import { prisma } from "@/lib/prisma";
import { getTranslation } from "@/lib/utils/get-translation";

export default async function ShopMenu() {
    const t = await getTranslations("Shop.Navigation");
    const locale = await getLocale();
    const categories = await prisma.category.findMany({
        where: { deletedAt: null },
        include: { translations: true },

    });

    return (
        <div className="w-full 2xl:border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 px-2">
            <div className="container mx-auto border-b 2xl:border-0">
                <nav className="flex items-center justify-start lg:justify-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide py-3">
                    <NavLink
                        href="/shop"
                        exact={true}
                        inactiveClassName="border-transparent"
                        activeClassName="text-emerald-600 border-emerald-600"
                        className="text-sm md:text-base font-semibold uppercase tracking-wider transition-all border-b-2 hover:text-emerald-600 hover:border-emerald-600"
                    >
                        {t("all")}
                    </NavLink>
                    {categories.map((category) => {
                        const translation = getTranslation(category, locale);
                        const categoryName = translation?.name || category.slug;

                        return (
                            <NavLink
                                key={category.id}
                                href={`/shop/${category.slug}`}
                                exact={false}
                                inactiveClassName=" border-transparent"
                                activeClassName="text-emerald-600 border-emerald-600"
                                className="text-sm md:text-base font-semibold uppercase tracking-wider transition-all border-b-2 hover:text-emerald-600 hover:border-emerald-600"
                            >
                                {categoryName}
                            </NavLink>
                        );
                    })}
                    <NavLink
                        href="/shop/sale"
                        exact={false}
                        inactiveClassName="text-red-500 border-transparent"
                        activeClassName="text-red-600 border-red-600"
                        className="text-sm md:text-base font-bold uppercase tracking-wider transition-all border-b-2 hover:text-red-600 hover:border-red-600"
                    >
                        {t("sale")} %
                    </NavLink>
                </nav>
            </div>
        </div>
    );
}