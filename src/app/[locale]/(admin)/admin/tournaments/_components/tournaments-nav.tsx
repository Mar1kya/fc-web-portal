"use client"

import { NavLink } from "@/components/ui/nav-link"

export function TournamentsNav() {
    return (
        <div className="w-full border-b border-border">
            <nav className="flex w-full justify-start bg-transparent p-0 h-auto overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <NavLink
                    href="/admin/tournaments/matches"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Матчі
                </NavLink>
                <NavLink
                    href="/admin/tournaments/competitions"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Турніри
                </NavLink>
                <NavLink
                    href="/admin/tournaments/seasons"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Сезони
                </NavLink>
                <NavLink
                    href="/admin/tournaments/standings"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Таблиці
                </NavLink>
                <NavLink
                    href="/admin/tournaments/opponents"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Суперники
                </NavLink>
                <NavLink
                    href="/admin/tournaments/dictionary"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Переклад команд
                </NavLink>
            </nav>
        </div>
    )
}