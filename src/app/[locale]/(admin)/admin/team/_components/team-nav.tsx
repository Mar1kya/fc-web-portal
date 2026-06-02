"use client"

import { NavLink } from "@/components/ui/nav-link" 

export function TeamNav() {
    return (
        <div className="w-full border-b border-border">
            <nav className="flex w-full justify-start bg-transparent p-0 h-auto overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <NavLink
                    href="/admin/team/players"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Гравці
                </NavLink>
                <NavLink
                    href="/admin/team/staff"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Тренерський штаб
                </NavLink>
            </nav>
        </div>
    )
}