import { prisma } from "@/lib/prisma";
import { TeamContext } from "../../../../../../../generated/prisma";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/columns";

export const metadata = {
    title: "Керування тренерським штабом",
    description: "Сторінка керування тренерським штабом"
};


const teamTranslations: Record<TeamContext, string> = {
    MAIN_TEAM: "Основна команда",
    U19: "U-19",
    ACADEMY: "Академія",
    GENERAL: "Загальний склад",
};

export default async function StaffPage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
    const { team } = await searchParams;

    const existingTeamsObj = await prisma.coach.findMany({
        where: { deletedAt: null },
        distinct: ['teamContext'],
        select: { teamContext: true },
    });

    const availableTeams = existingTeamsObj.map(t => t.teamContext);

    const currentTeam = team && availableTeams.includes(team as TeamContext)
        ? (team as TeamContext)
        : availableTeams[0] || TeamContext.MAIN_TEAM;

    const coaches = await prisma.coach.findMany({
        where: {
            deletedAt: null,
            teamContext: currentTeam
        },
        include: { translations: true },
        orderBy: { createdAt: "asc" }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full md:w-auto">
                    {availableTeams.length > 0 ? (
                        availableTeams.map((teamEnum) => {
                            const isActive = currentTeam === teamEnum;
                            return (
                                <Link
                                    key={teamEnum}
                                    href={`/admin/team/staff?team=${teamEnum}`}
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
                        <Button>
                            Основна команда
                        </Button>
                    )}
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                    <Button variant="outline" asChild className="gap-2">
                        <Link href="/admin/team/staff/archive">
                            <Archive className="w-4 h-4" />
                            Архів
                        </Link>
                    </Button>
                    <Button asChild className="gap-2">
                        <Link href="/admin/team/staff/create">
                            <Plus className="w-4 h-4" /> Додати тренера
                        </Link>
                    </Button>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={coaches}
                searchPlaceholder="Пошук за ім'ям..."
            />
        </div>
    );
}