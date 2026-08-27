import { getTranslation } from "@/lib/utils/get-translation";
import { SOFASCORE_TEAM_IDS, TARGET_TEAM_ORIGINAL_NAME } from "@/lib/constants";
import { getLocale, getTranslations } from "next-intl/server";
import StandingsTableClient, { ProcessedStandingItem } from "./standings-table-client";

type DictionaryEntry = {
    sofascoreId: number;
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

const OUR_TEAM_SOFASCORE_IDS = new Set(
    Object.values(SOFASCORE_TEAM_IDS).map(Number)
);

export default async function StandingsTable({ standings, dictionaries }: StandingsTableProps) {
    const t = await getTranslations("StandingsPage");
    const locale = await getLocale();

    const labels = {
        team: t("team"),
        played: t("played_short", { defaultMessage: "І" }),
        win: t("win_short", { defaultMessage: "В" }),
        draw: t("draw_short", { defaultMessage: "Н" }),
        lose: t("lose_short", { defaultMessage: "П" }),
        goals: t("goals_short", { defaultMessage: "М" }),
        points: t("points_short", { defaultMessage: "О" }),
        playedTitle: t("playedTitle"),
        winTitle: t("winTitle"),
        drawTitle: t("drawTitle"),
        loseTitle: t("loseTitle"),
        goalsTitle: t("goalsTitle"),
        pointsTitle: t("pointsTitle"),
    };

    const processedStandings: ProcessedStandingItem[] = standings.map((team) => {
        const dictEntry = dictionaries.find(d =>
            d.originalName === team.teamName ||
            d.translations.some(tr => tr.name === team.teamName)
        );

        const translatedTeamName = getTranslation(dictEntry, locale)?.name || team.teamName;

        const isTargetTeam = dictEntry
            ? OUR_TEAM_SOFASCORE_IDS.has(dictEntry.sofascoreId) ||
              dictEntry.originalName === TARGET_TEAM_ORIGINAL_NAME
            : false;

        const goalDifference = team.goalsFor - team.goalsAgainst;

        return {
            ...team,
            translatedTeamName,
            isTargetTeam,
            goalDifference,
        };
    });

    return (
        <StandingsTableClient
            data={processedStandings}
            labels={labels}
        />
    );
}