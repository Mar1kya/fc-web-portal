import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getTranslation } from "@/lib/utils/get-translation";
import { TARGET_TEAM_ORIGINAL_NAME } from "@/lib/constants";
import { getLocale, getTranslations } from "next-intl/server";

type DictionaryEntry = {
    originalName: string;
    translations: {
        language: string;
        name: string;
    }[];
};

type StandingItem = {
    id: string;
    rank: number;
    teamName: string;
    teamLogo: string | null;
    played: number;
    win: number;
    draw: number;
    lose: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
};

type StandingsTableProps = {
    standings: StandingItem[];
    dictionaries: DictionaryEntry[];
};

export default async function StandingsTable({ standings, dictionaries }: StandingsTableProps) {
    const t = await getTranslations("StandingsPage");
    const locale = await getLocale();

    return (
        <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-x-auto">
            <Table className="min-w-150">
                <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/50">
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>{t("team")}</TableHead>
                        <TableHead className="text-center w-12" title={t("playedTitle")}>{t("played_short", { defaultMessage: "І" })}</TableHead>
                        <TableHead className="text-center w-12" title={t("winTitle")}>{t("win_short", { defaultMessage: "В" })}</TableHead>
                        <TableHead className="text-center w-12" title={t("drawTitle")}>{t("draw_short", { defaultMessage: "Н" })}</TableHead>
                        <TableHead className="text-center w-12" title={t("loseTitle")}>{t("lose_short", { defaultMessage: "П" })}</TableHead>
                        <TableHead className="text-center w-20" title={t("goalsTitle")}>{t("goals_short", { defaultMessage: "М" })}</TableHead>
                        <TableHead className="text-center w-16" title={t("pointsTitle")}>{t("points_short", { defaultMessage: "О" })}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {standings.map((team) => {
                        const dictEntry = dictionaries.find(d =>
                            d.originalName === team.teamName ||
                            d.translations.some(tr => tr.name === team.teamName)
                        );
                        const translatedTeamName = getTranslation(dictEntry, locale)?.name || team.teamName;
                        const isTargetTeam = dictEntry?.originalName === TARGET_TEAM_ORIGINAL_NAME;

                        return (
                            <TableRow
                                key={team.id}
                                className={`transition-colors ${isTargetTeam ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-muted/50"}`}
                            >
                                <TableCell className={`text-center font-medium ${isTargetTeam ? "text-primary" : ""}`}>
                                    {team.rank}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center font-medium">
                                        {team.teamLogo && (
                                            <div className="relative w-8 h-8 mr-3 shrink-0">
                                                <Image
                                                    src={team.teamLogo}
                                                    alt={translatedTeamName}
                                                    fill
                                                    sizes="32px"
                                                    className="object-contain"
                                                    unoptimized
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                        )}
                                        <span className={isTargetTeam ? "font-bold" : ""}>
                                            {translatedTeamName}
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
                                <TableCell className={`text-center font-bold text-base ${isTargetTeam ? "text-primary" : ""}`}>
                                    {team.points}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}