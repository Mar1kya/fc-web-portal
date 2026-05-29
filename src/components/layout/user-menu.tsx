"use client"

import Image from "next/image";
import { User, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "../ui/button";

type UserMenuProps = {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
    };
}

export default function UserMenu({ user }: UserMenuProps) {
    const t = useTranslations("Header.UserMenu");
    const clearCart = useCartStore((state) => state.clearCart);

    const handleLogout = async () => {
        clearCart();
        await signOut({ callbackUrl: "/" });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-8 h-8 rounded-lg hover:text-emerald-600 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                >
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || "user"}
                            width={26}
                            height={26}
                            className="w-6.5 h-6.5 rounded-md object-cover"
                        />
                    ) : (
                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-2">
                <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 w-4 h-4" />
                        {t("profile")}
                    </Link>
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer">
                            <LayoutDashboard className="mr-2 w-4 h-4" />
                            {t("adminPanel")}
                        </Link>
                    </DropdownMenuItem>
                )}
                {user.role !== 'ADMIN' && (
                    <DropdownMenuItem asChild>
                        <Link href="/profile/history" className="flex items-center cursor-pointer">
                            <ShoppingBag className="mr-2 w-4 h-4" />
                            {t("orderHistory")}
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-500/10 dark:focus:text-red-400 cursor-pointer transition-colors"
                >
                    <LogOut className="mr-2 w-4 h-4" />
                    {t("logOut")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}