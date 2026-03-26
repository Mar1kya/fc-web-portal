import { cn } from "@/lib/utils";
import React from "react";

type H1Props = React.HTMLAttributes<HTMLHeadingElement>;

export default function H1({ className, children, ...props }: H1Props) {
    return <h1 className={cn("text-2xl font-bold tracking-tight text-foreground", className)} {...props}>
        {children}
    </h1>
}