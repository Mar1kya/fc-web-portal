"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/useCartStore";

export default function LogoutButton() {
    const t = useTranslations("ProfilePage.Sidebar");
    const clearCart = useCartStore((state) => state.clearCart);

    const handleLogout = async () => {
        clearCart();
        await signOut({ callbackUrl: "/" });
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer"
        >
            <LogOut className="mr-2 w-4 h-4" />
            {t("logOut")}
        </button>
    );
}