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
import { MoreHorizontal, Pencil, Eye, Trash2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { toast } from "sonner"
import { getTranslation } from "@/lib/utils/get-translation"
import { type CoachWithRelations } from "./columns"
import { softDeleteCoach } from "@/actions/team"

type CoachActionsProps = {
    coach: CoachWithRelations;
}

export function CoachActions({ coach }: CoachActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const translation = getTranslation(coach, "uk");
    const name = translation?.name || "Без імені";
    const role = translation?.role || "тренера";

    const handleDelete = () => {
        startTransition(async () => {
            const result = await softDeleteCoach(coach.id);

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
                        <Link href={`/team/staff/${coach.slug}`} target="_blank" className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Оглянути
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/team/staff/${coach.slug}/edit`} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Редагувати
                        </Link>
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                            className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Видалити
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Профіль {role} <strong>&quot;{name}&quot;</strong> буде переміщено в архів. Він більше не відображатиметься на сайті.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Скасувати</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? "Видалення..." : "Видалити"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}