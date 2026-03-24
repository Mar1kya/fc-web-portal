"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import React from "react";

type NavLinkProps = React.ComponentProps<typeof Link> & {
    activeClassName?: string;
    inactiveClassName?: string;
    exact?: boolean; 
};

export function NavLink({
    href,
    className,
    activeClassName,
    inactiveClassName,
    exact = true,
    children,
    ...props
}: NavLinkProps) {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

    return (
        <Link
            href={href}
            className={cn(
                "transition-colors", 
                className,
                isActive ? activeClassName : inactiveClassName
            )}
            {...props}
        >
            {children}
        </Link>
    );
}