"use client"

import { useState, useTransition } from "react"
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
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Archive } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { toast } from "sonner"
import { type GalleryWithRelations } from "./columns"
import { getTranslation } from "@/lib/utils/get-translation"
import { softDeleteGallery } from "@/actions/gallery"

type GalleryActionsProps = {
    gallery: GalleryWithRelations
}

export function GalleryActions({ gallery }: GalleryActionsProps) {
    const [isPending, startTransition] = useTransition()
    const [isAlertOpen, setIsAlertOpen] = useState(false)
    const title = getTranslation(gallery, "uk")?.title || "Без назви"

    const handleDelete = () => {
        startTransition(async () => {
            const result = await softDeleteGallery(gallery.id)

            if (result.success) {
                toast.success(result.message)
                setIsAlertOpen(false)
            } else {
                toast.error(result.message)
                setIsAlertOpen(false)
            }
        })
    }

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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/admin/gallery/${gallery.id}/edit`}
                            className="cursor-pointer"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Редагувати
                        </Link>
                    </DropdownMenuItem>
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
                        Галерею <strong>&quot;{title}&quot;</strong> буде переміщено в архів. Вона більше не буде відображатися на сайті.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Скасувати</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? "Архівація..." : "В архів"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}