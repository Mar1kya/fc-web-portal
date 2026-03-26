"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function LogoutButton() {
    const t = useTranslations("ProfilePage.Sidebar")
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors text-red-500 hover:bg-accent hover:text-accent-foreground cursor-pointer">
            <LogOut className="mr-2 w-4 h-4" />
            {t("logOut")}
        </button>
    );
}