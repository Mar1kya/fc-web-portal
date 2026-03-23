"use client"

import Image from "next/image";
import { User, LogOut, LayoutDashboard } from "lucide-react";
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

type UserMenuProps = {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
    };
}

export function UserMenu({ user }: UserMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={user.name || "user"}
                        width="26"
                        height="26"
                        className="rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                ) : (
                    <User className="w-5 h-5 cursor-pointer hover:text-emerald-600 transition-colors" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-2">
                <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer">
                            <LayoutDashboard className="mr-2 w-4 h-4" />
                            Адмін панель
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 w-4 h-4" />
                        Профіль
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-500 focus:text-white cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 w-4 h-4" />
                    Вийти
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}