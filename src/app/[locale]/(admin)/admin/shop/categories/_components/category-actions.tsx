"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Archive, Edit, MoreHorizontal, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Link } from "@/i18n/navigation"
import { getTranslation } from "@/lib/utils/get-translation"
import { softDeleteCategory } from "@/actions/category"
import { CategoryWithRelations } from "./columns"

export function CategoryActions({ category }: { category: CategoryWithRelations }) {
    const [isPending, startTransition] = useTransition();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const name = getTranslation(category, "uk")?.name || category.slug;

    const handleArchive = () => {
        startTransition(async () => {
            const result = await softDeleteCategory(category.id);
            if (result?.success) {
                toast.success(result.message);
                setIsAlertOpen(false);
            } else {
                toast.error(result?.message || "Помилка");
                setIsAlertOpen(false);
            }
        });
    };

    return (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                        <span className="sr-only">Відкрити меню дій</span>
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <MoreHorizontal className="h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Дії</DropdownMenuLabel>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/admin/shop/categories/${category.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редагувати
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                            className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            В архів
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Переміщення в архів</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ви збираєтеся перемістити категорію <strong>&quot;{name}&quot;</strong> в архів.
                        Вона більше не буде відображатися в магазині. Ви зможете відновити її пізніше з кошика.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Скасувати</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleArchive}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isPending ? "Архівація..." : "В архів"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}