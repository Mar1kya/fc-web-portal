"use client"

import Image from "next/image"
import {
    LayoutDashboard,
    Newspaper,
    Shirt,
    LogOut,
    User as UserIcon,
    ChevronsUpDown,
    Trophy,
} from "lucide-react"
import { signOut } from "next-auth/react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NavLink } from "../ui/nav-link"

const adminLinks = [
    { title: "Дашборд", url: "/admin", icon: LayoutDashboard },
    { title: "Новини", url: "/admin/news", icon: Newspaper },
    { title: "Турніри та Матчі", url: "/admin/tournaments", icon: Trophy },
    { title: "Фаншоп", url: "/admin/shop", icon: Shirt },
]

type AdminSidebarProps = {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
    }
}

export function AdminSidebar({ user }: AdminSidebarProps) {

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton id="admin-sidebar-user-trigger" size="lg" asChild>
                            <NavLink href="/admin" exact={true}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-700 text-sidebar-primary-foreground">
                                    <LayoutDashboard className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold uppercase">Emerald Gang</span>
                                    <span className="text-xs text-muted-foreground">Адмін-панель</span>
                                </div>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu className="px-2 mt-4 gap-1">
                    {adminLinks.map((item) => {
                        const isExact = item.url === "/admin";
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title}>
                                    <NavLink
                                        href={item.url}
                                        exact={isExact}
                                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                        inactiveClassName="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    >
                                        <item.icon className="size-4" />
                                        <span>{item.title}</span>
                                    </NavLink>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    {user?.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.name || "user"}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                                            <UserIcon className="size-5" />
                                        </div>
                                    )}
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.name || "Admin"}</span>
                                        <span className="truncate text-xs">{user?.email || "admin@emeraldgang.com"}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg p-2"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="font-normal p-2">
                                    <div className="flex items-center gap-2 text-left text-sm">
                                        {user?.image ? (
                                            <Image
                                                src={user.image}
                                                alt={user.name || "user"}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                                                <UserIcon className="size-5" />
                                            </div>
                                        )}
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.name || "Admin"}</span>
                                            <span className="truncate text-xs">{user?.email || "admin@emeraldgang.com"}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <NavLink href="/profile" className="flex items-center cursor-pointer">
                                        <UserIcon className="mr-2 size-4" />
                                        Профіль
                                    </NavLink>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-500/10 dark:focus:text-red-400 cursor-pointer transition-colors"
                                >
                                    <LogOut className="mr-2 size-4" />
                                    Вийти
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}