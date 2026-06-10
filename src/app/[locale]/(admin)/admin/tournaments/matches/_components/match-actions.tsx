"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Archive, RefreshCw, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { forceSyncMatchDetails, softDeleteMatch } from "@/actions/match";
import { Match, MatchStatus } from "../../../../../../../../generated/prisma";

export function MatchActions({ match }: { match: Match }) {
    const [isPending, startTransition] = useTransition();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleSync = (e: Event) => {
        e.preventDefault();
        setIsSyncing(true);
        startTransition(async () => {
            const result = await forceSyncMatchDetails(match.id);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
            setIsSyncing(false);
        });
    };

    const handleArchive = () => {
        startTransition(async () => {
            const result = await softDeleteMatch(match.id);
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
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending || isSyncing}>
                        <span className="sr-only">Відкрити меню</span>
                        {isSyncing ? <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Дії</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/matches/${match.slug}`} target="_blank" className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Оглянути
                        </Link>
                    </DropdownMenuItem>
                    {match.status === MatchStatus.FINISHED && (
                        <DropdownMenuItem
                            onClick={(e) => handleSync(e.nativeEvent)}
                            disabled={isPending || isSyncing}
                            className="cursor-pointer"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            Синхронізувати деталі
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/admin/tournaments/matches/${match.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редагувати
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                            className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                            disabled={isPending || isSyncing}
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
                        Ви збираєтеся перемістити цей матч в архів.
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