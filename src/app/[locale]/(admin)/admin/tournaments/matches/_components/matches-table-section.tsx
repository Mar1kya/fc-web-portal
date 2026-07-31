import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { TeamContext } from "../../../../../../../../generated/prisma";

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

export default async function MatchesTableSection({ currentTeam }: { currentTeam: TeamContext }) {
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

    return (
        <DataTable
            columns={columns}
            data={matches}
            searchPlaceholder="Пошук за назвою команди..."
            filters={filterConfigs}
        />
    );
}