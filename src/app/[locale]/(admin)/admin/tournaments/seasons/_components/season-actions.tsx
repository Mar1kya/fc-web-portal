"use client"

import { useState, useTransition } from "react"
import { Season } from "../../../../../../../../generated/prisma"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger, AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Archive } from "lucide-react"
import { toast } from "sonner"
import { softDeleteSeason } from "@/actions/season"

export function SeasonActions({ season }: { season: Season }) {
    const [isPending, startTransition] = useTransition();
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleArchive = () => {
        startTransition(async () => {
            const result = await softDeleteSeason(season.id);
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
                    <DropdownMenuLabel>Дії</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/tournaments/seasons/${season.id}/edit`} className="cursor-pointer">
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
                        Ви збираєтеся перемістити сезон <strong>&quot;{season.name}&quot;</strong> в архів. 
                        Ви зможете відновити його пізніше з кошика.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Скасувати</AlertDialogCancel>
                    <Button 
                        variant="destructive"
                        onClick={handleArchive}
                        disabled={isPending}
                    >
                        {isPending ? "Архівація..." : "В архів"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}