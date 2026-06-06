"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { MatchActions } from "./match-actions";
import { getTranslation } from "@/lib/utils/get-translation";
import { Match, MatchStatus, Opponent, OpponentTranslation } from "../../../../../../../../generated/prisma";
import { StandingsTeamLogo } from "../../standings/_components/tandings-team-logo";

type MatchWithRelations = Match & {
    opponent: Opponent & { translations: OpponentTranslation[] };
};

const statusMap: Record<MatchStatus, { label: string; variant: "default" | "secondary" | "outline"; className: string }> = {
    SCHEDULED: { label: "Заплановано", variant: "outline", className: "text-muted-foreground border-muted-foreground/30" },
    LIVE: { label: "НАЖИВО", variant: "outline", className: "text-red-500 border-red-500/50 bg-red-500/10 animate-pulse" },
    FINISHED: { label: "Завершено", variant: "default", className: "bg-emerald-600 hover:bg-emerald-700" },
    POSTPONED: { label: "Перенесено", variant: "outline", className: "text-amber-500 border-amber-500/50 bg-amber-500/10" },
    CANCELED: { label: "Скасовано", variant: "secondary", className: "text-muted-foreground bg-muted/50" },
};

export const columns: ColumnDef<MatchWithRelations>[] = [
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                    Дата матчу
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.original.date);
            return (
                <div className="flex flex-col whitespace-nowrap">
                    <span className="text-sm font-medium">{date.toLocaleDateString("uk-UA")}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                        {date.toLocaleTimeString("uk-UA", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            );
        },
    },
    {
        id: "matchInfo",
        accessorFn: (row) => {
            const opponentName = getTranslation(row.opponent, "uk")?.name || "Суперник";
            return `Смарагдова Банда ${opponentName}`;
        },
        header: "Матч",
        cell: ({ row }) => {
            const match = row.original;
            const opponentName = getTranslation(match.opponent, "uk")?.name || "Суперник";
            const ourLogoUrl = "https://api.sofascore.app/api/v1/team/258536/image";
            const homeLogo = match.isHomeGame ? ourLogoUrl : match.opponent.logoUrl;
            const awayLogo = match.isHomeGame ? match.opponent.logoUrl : ourLogoUrl;
            const homeName = match.isHomeGame ? "Смарагдова Банда" : opponentName;
            const awayName = match.isHomeGame ? opponentName : "Смарагдова Банда";
            const showScore = match.status === "FINISHED" || match.status === "LIVE";
            const scoreText = showScore ? `${match.homeScore ?? 0} : ${match.awayScore ?? 0}` : "- : -";

            return (
                <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-md border min-w-62.5 max-w-110">
                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="text-sm font-semibold truncate max-w-30" title={homeName}>{homeName}</span>
                        <StandingsTeamLogo src={homeLogo} alt={homeName} fallbackText={homeName} />
                    </div>
                    <div className="px-3 py-1 bg-background rounded border font-mono font-bold text-sm shadow-sm whitespace-nowrap">
                        {scoreText}
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-start">
                        <StandingsTeamLogo src={awayLogo} alt={awayName} fallbackText={awayName} />
                        <span className="text-sm font-semibold truncate max-w-30" title={awayName}>{awayName}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => {
            const statusInfo = statusMap[row.original.status];
            return (
                <Badge 
                    variant={statusInfo.variant} 
                    className={`text-xs px-2.5 py-0.5 font-medium whitespace-nowrap ${statusInfo.className}`}
                >
                    {statusInfo.label}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            if (!value || value === "ALL") return true;
            return row.getValue(id) === value;
        },
    },
    {
        accessorKey: "isDetailsSynced",
        header: "Деталі (Склади/Події)",
        cell: ({ row }) => {
            const isFinished = row.original.status === "FINISHED";
            const isSynced = row.original.isDetailsSynced;

            if (!isFinished) return <span className="text-xs text-muted-foreground">—</span>;

            return isSynced ? (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs px-2.5 py-0.5 whitespace-nowrap">
                    Синхронізовано
                </Badge>
            ) : (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-xs px-2.5 py-0.5 whitespace-nowrap">
                    Очікує синхр.
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            if (value === "ALL") return true;
            const isFinished = row.original.status === "FINISHED";
            if (value === "SYNCED") return isFinished && row.original.isDetailsSynced;
            if (value === "PENDING") return isFinished && !row.original.isDetailsSynced;
            return true;
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <div className="flex justify-end"><MatchActions match={row.original} /></div>,
    },
];