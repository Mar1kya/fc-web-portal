"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Standing } from "../../../../../../../../generated/prisma";
import { StandingsTeamLogo } from "./tandings-team-logo";

export const columns: ColumnDef<Standing>[] = [
    {
        accessorKey: "rank",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="w-full flex items-center justify-center hover:bg-transparent px-0"
            >
                # <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => <div className="font-bold text-center">{row.original.rank}</div>,
    },
    {
        accessorKey: "teamName",
        header: "Команда",
        cell: ({ row }) => {
            const team = row.original;
            return (
                <div className="flex items-center gap-3">
                    <StandingsTeamLogo 
                        src={team.teamLogo} 
                        alt={team.teamName} 
                        fallbackText={team.teamName} 
                    />
                    <span className="font-medium">{team.teamName}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "played",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="w-full flex items-center justify-center hover:bg-transparent px-0"
            >
                І <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-center font-medium">{row.original.played}</div>,
    },
    {
        accessorKey: "win",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="w-full flex items-center justify-center hover:bg-transparent px-0"
            >
                В <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-center font-medium">{row.original.win}</div>,
    },
    {
        accessorKey: "draw",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="w-full flex items-center justify-center hover:bg-transparent px-0"
            >
                Н <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-center font-medium">{row.original.draw}</div>,
    },
    {
        accessorKey: "lose",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="w-full flex items-center justify-center hover:bg-transparent px-0"
            >
                П <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-center font-medium">{row.original.lose}</div>,
    },
    {
        accessorKey: "goalsDiff",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="w-full flex items-center justify-center hover:bg-transparent px-0"
            >
                М <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="text-center font-medium text-muted-foreground whitespace-nowrap">
                {row.original.goalsFor} - {row.original.goalsAgainst}
            </div>
        ),
    },
    {
        accessorKey: "points",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="w-full flex items-center justify-center hover:bg-transparent px-0"
            >
                О <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-center font-bold text-base">{row.original.points}</div>,
    },
];