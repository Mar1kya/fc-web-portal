import { User, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "@/components/ui/nav-link";
import LogoutButton from "./logout-button";
import { getTranslations } from "next-intl/server";

export default async function ProfileSidebar() {
    const t = await getTranslations("ProfilePage.Sidebar");
    const itemVariants = "flex items-center px-3 py-2 rounded-md text-sm transition-colors cursor-pointer";
    return (
        <nav className="flex flex-col w-full px-2 py-4 gap-1">
            <NavLink
                href="/profile"
                exact={true}
                className={itemVariants}
                activeClassName="bg-emerald-600/10 text-emerald-600 font-medium"
                inactiveClassName="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
                <User className="mr-2 w-4 h-4" />
                {t("personalData")}
            </NavLink>
            <NavLink
                href="/profile/history"
                exact={false}
                className={itemVariants}
                activeClassName="bg-emerald-600/10 text-emerald-600 font-medium"
                inactiveClassName="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
                <ShoppingBag className="mr-2 w-4 h-4" />
                {t("orderHistory")}
            </NavLink>
            <Separator className="my-2" />
            <LogoutButton />
        </nav>
    );
}