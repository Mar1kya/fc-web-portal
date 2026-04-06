import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";

export default async function StandingsMini() {
    const t = await getTranslations("NewsPage.StandingsMini");
    const locale = await getLocale();
    const allStandings = await prisma.standing.findMany({
        orderBy: { rank: "asc" },
        include: {
            tournament: {
                include: {
                    translations: true,
                },
            },
            season: true,
        },
    });
    const dictionaries = await prisma.teamDictionary.findMany({
        include: {
            translations: true,
        }
    });

    if (allStandings.length === 0) return null;

    const targetTeam = "Emerald Gang";
    const targetIndex = allStandings.findIndex((standing) =>
        standing.teamName.includes(targetTeam)
    );

    let startIndex = 0;
    if (targetIndex !== -1) {
        startIndex = Math.max(0, targetIndex - 2);
        if (startIndex + 5 > allStandings.length) {
            startIndex = Math.max(0, allStandings.length - 5);
        }
    }
    const displayStandings = allStandings.slice(startIndex, startIndex + 5);

    const firstRow = allStandings[0];
    const translatedTournament = getTranslation(firstRow.tournament, locale);
    const tournamentName = translatedTournament?.name || t("title");
    const seasonName = firstRow.season?.name || "";

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                    {tournamentName}
                    <span className="text-xs font-normal text-muted-foreground">
                        {seasonName}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-2">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-7.5 h-8 text-center px-1 text-[10px] font-semibold">#</TableHead>
                            <TableHead className="h-8 px-1 text-[10px] font-semibold">{t("team")}</TableHead>
                            <TableHead className="w-7.5 h-8 text-center px-1 text-[10px] font-semibold" title={t("playedTitle")}>{t("played")}</TableHead>
                            <TableHead className="w-7.5 h-8 text-center px-1 text-[10px] font-semibold" title={t("pointsTitle")}>{t("points")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayStandings.map((team) => {
                            const isTargetTeam = team.teamName.includes(targetTeam);
                            const dictEntry = dictionaries.find(d =>
                                d.originalName === team.teamName ||
                                d.translations.some(tr => tr.name === team.teamName)
                            );
                            const translatedTeamName = getTranslation(dictEntry, locale)?.name || team.teamName;

                            return (
                                <TableRow
                                    key={team.id}
                                    className={`border-b-0 transition-colors ${isTargetTeam ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"}`}
                                >
                                    <TableCell className={`py-2 px-1 text-center text-xs ${isTargetTeam ? "font-bold text-primary" : "text-muted-foreground"}`}>
                                        {team.rank}
                                    </TableCell>
                                    <TableCell className="py-2 px-1">
                                        <div className="flex items-center overflow-hidden">
                                            {team.teamLogo && (
                                                <div className="relative w-5 h-5 mr-2 shrink-0">
                                                    <Image
                                                        src={team.teamLogo}
                                                        alt={translatedTeamName}
                                                        fill
                                                        sizes="20px"
                                                        className="object-contain"
                                                    />
                                                </div>
                                            )}
                                            <span className={`text-sm truncate ${isTargetTeam ? "font-bold" : "font-medium"}`}>
                                                {translatedTeamName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={`py-2 px-1 text-center text-xs ${isTargetTeam ? "font-semibold" : "text-muted-foreground"}`}>
                                        {team.played}
                                    </TableCell>
                                    <TableCell className={`py-2 px-1 text-center text-xs font-bold ${isTargetTeam ? "text-primary" : ""}`}>
                                        {team.points}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="p-2 border-t border-dashed">
                <Button asChild variant="ghost" className="w-full h-8 text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/standings" className="flex items-center justify-center">
                        {t("fullTable")}
                        <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}