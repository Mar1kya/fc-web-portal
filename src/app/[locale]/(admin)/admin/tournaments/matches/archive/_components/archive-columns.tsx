"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { ArchiveActions } from "./archive-actions";
import { getTranslation } from "@/lib/utils/get-translation";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Match, Opponent, OpponentTranslation } from "../../../../../../../../../generated/prisma";
import { StandingsTeamLogo } from "../../../standings/_components/tandings-team-logo";

type MatchWithRelations = Match & {
    opponent: Opponent & { translations: OpponentTranslation[] };
};

export const archiveColumns: ColumnDef<MatchWithRelations>[] = [
    {
        accessorKey: "date",
        header: "Дата матчу",
        cell: ({ row }) => {
            const date = new Date(row.original.date);
            return (
                <div className="flex flex-col whitespace-nowrap opacity-60">
                    <span className="text-sm font-medium">{format(date, "d MMM yyyy", { locale: uk })}</span>
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

            return (
                <div className="flex items-center gap-4 bg-muted/10 p-2 rounded-md border min-w-62.5 max-w-110 opacity-70 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="text-sm font-semibold truncate max-w-30" title={homeName}>{homeName}</span>
                        <StandingsTeamLogo src={homeLogo} alt={homeName} fallbackText={homeName} />
                    </div>
                    <div className="px-3 py-1 bg-background rounded border font-mono font-bold text-sm shadow-sm whitespace-nowrap">
                        {match.homeScore ?? 0} : {match.awayScore ?? 0}
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
        accessorKey: "deletedAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4 text-muted-foreground"
            >
                Дата видалення
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            if (!row.original.deletedAt) return null;
            const date = new Date(row.original.deletedAt);
            return (
                <div className="flex flex-col whitespace-nowrap text-muted-foreground">
                    <span className="text-sm">{date.toLocaleDateString("uk-UA")}</span>
                    <span className="text-xs">{date.toLocaleTimeString("uk-UA", { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <div className="flex justify-end"><ArchiveActions match={row.original} /></div>,
    },
];