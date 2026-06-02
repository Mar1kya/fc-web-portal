"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, RefreshCcw, Trash } from "lucide-react"
import { toast } from "sonner"
import { restorePost, hardDeletePost } from "@/actions/news"
import { getTranslation } from "@/lib/utils/get-translation"
import { type PostWithRelations } from "../../_components/columns"

export function TrashActions({ post }: { post: PostWithRelations }) {
    const [isPending, startTransition] = useTransition();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const title = getTranslation(post, "uk")?.title || "Без заголовку";

    const handleRestore = () => {
        startTransition(async () => {
            const result = await restorePost(post.id);
            if (result.success) toast.success(result.message);
            else toast.error(result.message);
        });
    };

    const handleHardDelete = () => {
        startTransition(async () => {
            const result = await hardDeletePost(post.id);
            if (result.success) {
                toast.success(result.message);
                setIsAlertOpen(false);
            } else {
                toast.error(result.message);
                setIsAlertOpen(false);
            }
        });
    };

    return (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                        <span className="sr-only">Відкрити меню</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Дії кошика</DropdownMenuLabel>
                    <DropdownMenuItem 
                        onClick={handleRestore}
                        disabled={isPending}
                        className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-500/10 cursor-pointer"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Відновити
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                            className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Видалити назавжди
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Остаточне видалення</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ви збираєтеся назавжди видалити публікацію <strong>&quot;{title}&quot;</strong>. 
                        Цю дію неможливо скасувати. Усі переклади будуть втрачені.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Скасувати</AlertDialogCancel>
                    <Button 
                        variant="destructive"
                        onClick={handleHardDelete}
                        disabled={isPending}
                    >
                        {isPending ? "Видалення..." : "Знищити назавжди"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}