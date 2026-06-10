import { useTranslations } from "next-intl";
import { Activity, Goal, Shield, Target, AlertCircle } from "lucide-react";
import { calculateHybridStats, PlayerWithHybridStats } from "@/lib/utils/player-stats";

type PlayerQuickStatsProps = {
    player: PlayerWithHybridStats;
};

export default function PlayerQuickStats({ player }: PlayerQuickStatsProps) {
    const t = useTranslations("PlayerStats");
    const isGoalkeeper = player.position === "GOALKEEPER";
    const statsData = calculateHybridStats(player);
    const stats = isGoalkeeper
        ? [
            { label: t("matches"), value: statsData.matches, icon: <Activity className="w-6 h-6 text-emerald-600" /> },
            { label: t("cleanSheets"), value: statsData.cleanSheets, icon: <Shield className="w-6 h-6 text-emerald-600" /> },
            { label: t("conceded"), value: statsData.conceded, icon: <AlertCircle className="w-6 h-6 text-emerald-600" /> },
        ]
        : [
            { label: t("matches"), value: statsData.matches, icon: <Activity className="w-6 h-6 text-emerald-600" /> },
            { label: t("goals"), value: statsData.goals, icon: <Goal className="w-6 h-6 text-emerald-600" /> },
            { label: t("assists"), value: statsData.assists, icon: <Target className="w-6 h-6 text-emerald-600" /> },
        ];

    return (
        <div className="w-full bg-card border rounded-lg mt-4 overflow-hidden">
            <div className="flex flex-col md:flex-row w-full divide-x divide-y md:divide-y-0 divide-border">
                {stats.map((stat, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-center p-6 gap-2">
                        <div className="flex items-center gap-3">
                            {stat.icon}
                            <span className="text-3xl font-black tracking-tight text-foreground">
                                {String(stat.value)}
                            </span>
                        </div>
                        <span className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">
                            {stat.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}