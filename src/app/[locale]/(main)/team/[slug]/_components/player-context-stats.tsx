import { getTranslations } from "next-intl/server";
import { Activity, Goal, Shield, Target, AlertCircle, Info } from "lucide-react";
import { calculateStatsByContext, PlayerWithHybridStats } from "@/lib/utils/player-stats";

type PlayerContextStatsProps = {
    player: PlayerWithHybridStats;
};

export default async function PlayerContextStats({ player }: PlayerContextStatsProps) {
    const t = await getTranslations("PlayerStats");
    const tEnums = await getTranslations("Enums");
    const isGoalkeeper = player.position === "GOALKEEPER";
    const contextStats = calculateStatsByContext(player);

    if (contextStats.length < 2) {
        return null;
    }

    return (
        <div className="w-full bg-card border rounded-lg mt-4 overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b px-6 py-4">
                <h3 className="text-lg font-bold uppercase tracking-tight">
                    {t("contextStats.title")}
                </h3>
            </div>

            <div className="divide-y divide-border">
                {contextStats.map((stat) => {
                    let contextName: string = stat.teamContext;
                    try {
                        contextName = tEnums(`TeamContext.${stat.teamContext}`);
                    } catch {
                    }

                    const rows = isGoalkeeper
                        ? [
                            { label: t("matches"), value: stat.matches, icon: <Activity className="w-5 h-5 text-emerald-600" /> },
                            { label: t("cleanSheets"), value: stat.cleanSheets, icon: <Shield className="w-5 h-5 text-emerald-600" /> },
                            { label: t("conceded"), value: stat.conceded, icon: <AlertCircle className="w-5 h-5 text-emerald-600" /> },
                        ]
                        : [
                            { label: t("matches"), value: stat.matches, icon: <Activity className="w-5 h-5 text-emerald-600" /> },
                            { label: t("goals"), value: stat.goals, icon: <Goal className="w-5 h-5 text-emerald-600" /> },
                            { label: t("assists"), value: stat.assists, icon: <Target className="w-5 h-5 text-emerald-600" /> },
                        ];

                    return (
                        <div key={stat.teamContext} className="flex flex-col gap-3 px-6 py-4">
                            <span className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">
                                {contextName}
                            </span>
                            <div className="flex flex-wrap gap-6">
                                {rows.map((row, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        {row.icon}
                                        <span className="text-xl font-black tracking-tight text-foreground">
                                            {String(row.value)}
                                        </span>
                                        <span className="text-xs font-medium uppercase text-muted-foreground">
                                            {row.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-start gap-2 border-t bg-muted/40 px-6 py-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                    {t("contextStats.note")}
                </p>
            </div>
        </div>
    );
}