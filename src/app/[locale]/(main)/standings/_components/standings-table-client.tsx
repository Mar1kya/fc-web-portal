"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import TeamLogo from "../../matches/_components/team-logo";

export type ProcessedStandingItem = {
    id: string;
    rank: number;
    teamName: string;
    translatedTeamName: string;
    teamLogo: string | null;
    isTargetTeam: boolean;
    played: number;
    win: number;
    draw: number;
    lose: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number; 
    points: number;
};

type SortKey = 'rank' | 'played' | 'win' | 'draw' | 'lose' | 'goalDifference' | 'points';

type StandingsTableClientProps = {
    data: ProcessedStandingItem[];
    labels: {
        team: string; played: string; win: string; draw: string; lose: string; goals: string; points: string;
        playedTitle: string; winTitle: string; drawTitle: string; loseTitle: string; goalsTitle: string; pointsTitle: string;
    };
};

export default function StandingsTableClient({ data, labels }: StandingsTableClientProps) {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'desc'; 
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig) return 0; 
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getSortIcon = (key: SortKey) => {
        if (sortConfig?.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-emerald-600" /> : <ArrowDown className="w-3 h-3 ml-1 text-emerald-600" />;
    };

    return (
        <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-x-auto">
            <Table className="min-w-150">
                <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/50">
                        <TableHead className="w-12 text-center cursor-pointer group" onClick={() => handleSort('rank')}>
                            <div className="flex items-center justify-center">#{getSortIcon('rank')}</div>
                        </TableHead>
                        <TableHead>{labels.team}</TableHead>
                        <TableHead className="text-center w-12 cursor-pointer group" title={labels.playedTitle} onClick={() => handleSort('played')}>
                            <div className="flex items-center justify-center">{labels.played}{getSortIcon('played')}</div>
                        </TableHead>
                        <TableHead className="text-center w-12 cursor-pointer group" title={labels.winTitle} onClick={() => handleSort('win')}>
                            <div className="flex items-center justify-center">{labels.win}{getSortIcon('win')}</div>
                        </TableHead>
                        <TableHead className="text-center w-12 cursor-pointer group" title={labels.drawTitle} onClick={() => handleSort('draw')}>
                            <div className="flex items-center justify-center">{labels.draw}{getSortIcon('draw')}</div>
                        </TableHead>
                        <TableHead className="text-center w-12 cursor-pointer group" title={labels.loseTitle} onClick={() => handleSort('lose')}>
                            <div className="flex items-center justify-center">{labels.lose}{getSortIcon('lose')}</div>
                        </TableHead>
                        <TableHead className="text-center w-20 cursor-pointer group" title={labels.goalsTitle} onClick={() => handleSort('goalDifference')}>
                            <div className="flex items-center justify-center">{labels.goals}{getSortIcon('goalDifference')}</div>
                        </TableHead>
                        <TableHead className="text-center w-16 cursor-pointer group" title={labels.pointsTitle} onClick={() => handleSort('points')}>
                            <div className="flex items-center justify-center">{labels.points}{getSortIcon('points')}</div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map((team) => (
                        <TableRow
                            key={team.id}
                            className={`transition-colors ${team.isTargetTeam ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-muted/50"}`}
                        >
                            <TableCell className={`text-center font-medium ${team.isTargetTeam ? "text-primary" : ""}`}>
                                {team.rank}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center font-medium">
                                    <div className="relative w-8 h-8 mr-3 shrink-0 flex items-center justify-center">
                                        <TeamLogo src={team.teamLogo || ""} alt={team.translatedTeamName} />
                                    </div>
                                    <span className={team.isTargetTeam ? "font-bold" : ""}>
                                        {team.translatedTeamName}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">{team.played}</TableCell>
                            <TableCell className="text-center">{team.win}</TableCell>
                            <TableCell className="text-center">{team.draw}</TableCell>
                            <TableCell className="text-center">{team.lose}</TableCell>
                            <TableCell className="text-center text-muted-foreground whitespace-nowrap">
                                {team.goalsFor}-{team.goalsAgainst}
                            </TableCell>
                            <TableCell className={`text-center font-bold text-base ${team.isTargetTeam ? "text-primary" : ""}`}>
                                {team.points}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}