"use client"

import { NavLink } from "@/components/ui/nav-link"

export function ShopNav() {
    return (
        <div className="w-full border-b border-border">
            <nav className="flex w-full justify-start bg-transparent p-0 h-auto overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <NavLink
                    href="/admin/shop/orders"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Замовлення
                </NavLink>
                <NavLink
                    href="/admin/shop/products"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Товари
                </NavLink>
                <NavLink
                    href="/admin/shop/categories"
                    exact={false}
                    className="whitespace-nowrap cursor-pointer relative rounded-none border-b-2 px-4 py-3 font-medium shadow-none transition-none"
                    activeClassName="border-emerald-600 text-foreground"
                    inactiveClassName="border-transparent text-muted-foreground hover:text-foreground"
                >
                    Категорії
                </NavLink>
            </nav>
        </div>
    )
}