"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { restoreOrder } from "@/actions/order";
import { OrderPlain } from "../../_components/columns";

export function ArchiveActions({ order }: { order: OrderPlain }) {
    const [isPending, startTransition] = useTransition();

    const handleRestore = () => {
        startTransition(async () => {
            const result = await restoreOrder(order.id);
            if (result?.success) {
                toast.success(result.message);
            } else {
                toast.error(result?.message ?? "Не вдалося відновити замовлення");
            }
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                    <span className="sr-only">Відкрити меню</span>
                    {isPending
                        ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        : <MoreHorizontal className="h-4 w-4" />
                    }
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Дії архіву</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={handleRestore}
                    disabled={isPending}
                    className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-500/10 cursor-pointer"
                >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Відновити замовлення
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}