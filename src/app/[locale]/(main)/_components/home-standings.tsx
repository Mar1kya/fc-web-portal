import { getTranslation } from "@/lib/utils/get-translation";
import { TARGET_TEAM_ORIGINAL_NAME } from "@/lib/constants";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import StandingsTableClient, {
    ProcessedStandingItem,
} from "../standings/_components/standings-table-client";

const CONTEXT_ROWS = 2;
const TOTAL_ROWS_TO_SHOW = CONTEXT_ROWS * 2 + 1;

type DictionaryEntry = {
    originalName: string;
    translations: { language: string; name: string }[];
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
    goalsDiff: number;
    points: number;
};

type TournamentData = {
    slug: string;
    translations: { language: string; name: string }[];
    standings: StandingItem[];
};

type HomeStandingsProps = {
    tournament: TournamentData;
    dictionaries: DictionaryEntry[];
};

export default async function HomeStandings({
    tournament,
    dictionaries,
}: HomeStandingsProps) {
    const t = await getTranslations("StandingsPage");
    const tSection = await getTranslations("HomePage.Sections");

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

    const processed: ProcessedStandingItem[] = tournament.standings.map((team) => {
        const dictEntry = dictionaries.find(
            (d) =>
                d.originalName === team.teamName ||
                d.translations.some((tr) => tr.name === team.teamName)
        );

        const translatedTeamName =
            getTranslation(dictEntry, locale)?.name || team.teamName;

        const isTargetTeam =
            dictEntry?.originalName === TARGET_TEAM_ORIGINAL_NAME ||
            team.teamName === TARGET_TEAM_ORIGINAL_NAME;

        return {
            ...team,
            translatedTeamName,
            isTargetTeam,
            goalDifference: team.goalsFor - team.goalsAgainst,
        };
    });

    const targetIndex = processed.findIndex((row) => row.isTargetTeam);

    let sliced: ProcessedStandingItem[] = [];

    if (processed.length <= TOTAL_ROWS_TO_SHOW) {
        sliced = processed;
    } else if (targetIndex === -1) {
        sliced = processed.slice(0, TOTAL_ROWS_TO_SHOW);
    } else {
        let start = targetIndex - CONTEXT_ROWS;
        let end = targetIndex + CONTEXT_ROWS;

        if (start < 0) {
            start = 0;
            end = TOTAL_ROWS_TO_SHOW - 1;
        } else if (end >= processed.length) {
            end = processed.length - 1;
            start = processed.length - TOTAL_ROWS_TO_SHOW;
        }

        sliced = processed.slice(start, end + 1);
    }
    const tournamentName = getTranslation(tournament, locale)?.name || tournament.slug;

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {tournamentName}
                </span>
                <Link
                    href={`/standings/${tournament.slug}`}
                    className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                    {tSection("fullTable")}
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
            <StandingsTableClient data={sliced} labels={labels} />
        </div>
    );
}