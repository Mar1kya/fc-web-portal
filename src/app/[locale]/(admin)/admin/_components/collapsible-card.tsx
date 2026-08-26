"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STORAGE_PREFIX = "admin-dashboard-collapsed:"

type CollapsibleCardProps = {
    id: string
    title: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactNode
    defaultOpen?: boolean
    variant?: "card" | "plain"
    className?: string
    contentClassName?: string
    children: React.ReactNode
}

export function CollapsibleCard({
    id,
    title,
    description,
    action,
    defaultOpen = true,
    variant = "card",
    className,
    contentClassName,
    children,
}: CollapsibleCardProps) {
    const storageKey = `${STORAGE_PREFIX}${id}`
    const [open, setOpen] = React.useState(defaultOpen)

    React.useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey)
            if (stored !== null) setOpen(stored === "1")
        } catch {
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey])

    function handleOpenChange(next: boolean) {
        setOpen(next)
        try {
            localStorage.setItem(storageKey, next ? "1" : "0")
        } catch {
        }
    }

    const Wrapper = variant === "card" ? Card : "div"

    return (
        <Collapsible open={open} onOpenChange={handleOpenChange} asChild>
            <Wrapper className={className}>
                <CardHeader
                    className={cn(
                        "flex flex-row items-center justify-between gap-2 space-y-0",
                        variant === "plain" && "px-0"
                    )}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <CollapsibleTrigger asChild>
                            <Button variant="link" size="icon" className="h-8 w-8 shrink-0">
                                <ChevronDown
                                    className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                                />
                                <span className="sr-only">Згорнути / розгорнути</span>
                            </Button>
                        </CollapsibleTrigger>
                        <div className="min-w-0">
                            <CardTitle className="truncate">{title}</CardTitle>
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                    </div>
                    {action && <div className="shrink-0">{action}</div>}
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className={cn(variant === "plain" && "px-0 py-2", contentClassName)}>
                        {children}
                    </CardContent>
                </CollapsibleContent>
            </Wrapper>
        </Collapsible>
    )
}