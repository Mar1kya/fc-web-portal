import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/columns";
import { TeamContext } from "../../../../../../../generated/prisma";
import { SyncScheduleButton } from "./_components/sync-schedule-button";

export const metadata = {
    title: "Матчі",
    description: "Управління розкладом та результатами матчів",
};

const teamTranslations: Record<TeamContext, string> = {
    MAIN_TEAM: "Основна команда",
    U19: "U-19",
    ACADEMY: "Академія",
    GENERAL: "Загальний склад",
};

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
    const { team } = await searchParams;

    const existingTeamsObj = await prisma.match.findMany({
        where: { deletedAt: null },
        distinct: ['teamContext'],
        select: { teamContext: true },
    });

    const availableTeams = existingTeamsObj.map(t => t.teamContext);

    const currentTeam = team && availableTeams.includes(team as TeamContext)
        ? (team as TeamContext)
        : availableTeams[0] || TeamContext.MAIN_TEAM;

    const matches = await prisma.match.findMany({
        where: {
            deletedAt: null,
            teamContext: currentTeam,
        },
        include: {
            opponent: {
                include: { translations: true }
            },
            tournament: {
                include: { translations: true }
            },
            _count: {
                select: { lineup: true, events: true }
            }
        },
        orderBy: {
            date: "desc",
        },
    });

    const filterConfigs = [
        {
            columnId: "status",
            placeholder: "Статус матчу",
            options: [
                { label: "Заплановано", value: "SCHEDULED" },
                { label: "НАЖИВО", value: "LIVE" },
                { label: "Завершено", value: "FINISHED" },
                { label: "Перенесено", value: "POSTPONED" },
            ]
        },
        {
            columnId: "isDetailsSynced",
            placeholder: "Деталі матчу",
            options: [
                { label: "Готові (Синхр. / Ручні)", value: "SYNCED" },
                { label: "Очікують (Пусті)", value: "PENDING" },
            ]
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Матч-центр</h2>
                    <p className="text-muted-foreground mt-1">
                        Керуйте розкладом матчів. Основні ігри підтягуються з SofaScore автоматично.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <SyncScheduleButton />
                    <Button variant="outline" asChild>
                        <Link href="/admin/tournaments/matches/archive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Архів
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/tournaments/matches/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Ручний матч
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full">
                {availableTeams.length > 0 ? (
                    availableTeams.map((teamEnum) => {
                        const isActive = currentTeam === teamEnum;
                        return (
                            <Link
                                key={teamEnum}
                                href={`/admin/tournaments/matches?team=${teamEnum}`}
                            >
                                <Button
                                    variant={isActive ? "default" : "outline"}
                                    className={isActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                                >
                                    {teamTranslations[teamEnum] || teamEnum}
                                </Button>
                            </Link>
                        )
                    })
                ) : (
                    <Button variant="default" className="bg-emerald-600 text-white hover:bg-emerald-700">
                        Основна команда
                    </Button>
                )}
            </div>
            <div className="mt-2">
                <DataTable
                    columns={columns}
                    data={matches}
                    searchPlaceholder="Пошук за назвою команди..."
                    filters={filterConfigs}
                />
            </div>
        </div>
    );
}