import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { KPICards } from "./_components/kpi-cards"
import { DashboardTables } from "./_components/dashboard-tables"
import { RefreshButton } from "./_components/refresh-button"
import { TeamSwitcher } from "./_components/team-switcher"
import { PeriodSwitcher } from "./_components/period-switcher"
import { CollapsibleCard } from "./_components/collapsible-card"
import { parseTeamContext } from "@/lib/utils/team-context"
import { getShopAnalytics } from "@/lib/analytics/shop-analytics"
import { parseAnalyticsPeriod } from "@/lib/analytics/period"
import { AnalyticsSection } from "./_components/analytics-section"

export const metadata: Metadata = {
    title: "Дашборд",
    description: "Головна сторінка панелі керування Emerald Gang",
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ team?: string; period?: string }> }) {
    const { team: teamParam, period: periodParam } = await searchParams
    const teamContext = parseTeamContext(teamParam)
    const period = parseAnalyticsPeriod(periodParam)

    const [
        pendingOrdersCount,
        revenueAgg,
        nextMatch,
        activeNewsCount,
        recentOrders,
        lowStockVariants,
        unsyncedMatches,
        shopAnalytics
    ] = await Promise.all([
        prisma.order.count({ where: { status: "PENDING", deletedAt: null } }),
        prisma.order.aggregate({ _sum: { totalPrice: true }, where: { isPaid: true } }),
        prisma.match.findFirst({
            where: { status: "SCHEDULED", teamContext, deletedAt: null },
            orderBy: { date: "asc" },
            include: { opponent: { include: { translations: true } } }
        }),
        prisma.post.count({ where: { isPublished: true, deletedAt: null } }),
        prisma.order.findMany({
            take: 10,
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            include: {
                orderItems: {
                    include: { product: { include: { translations: true } } }
                }
            }
        }),
        prisma.productVariant.findMany({
            where: {
                stock: { lt: 5 },
                product: {
                    deletedAt: null,
                    isArchived: false,
                },
            },
            orderBy: { stock: "asc" },
            include: { product: { include: { translations: true } } }
        }),
        prisma.match.findMany({
            where: {
                status: "FINISHED",
                isDetailsSynced: false,
                teamContext,
                deletedAt: null,
                lineup: { none: {} },
                events: { none: {} },
            },
            take: 5,
            orderBy: { date: "desc" },
            include: {
                opponent: { include: { translations: true } },
                _count: {
                    select: { lineup: true, events: true }
                }
            }
        }),
        getShopAnalytics(period)
    ]);

    const totalRevenue = Number(revenueAgg._sum.totalPrice || 0);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Дашборд</h2>
                <div className="flex items-center space-x-2">
                    <TeamSwitcher value={teamContext} />
                    <RefreshButton />
                </div>
            </div>
            <CollapsibleCard id="kpi" title="KPI картки" variant="plain">
                <KPICards
                    teamContext={teamContext}
                    pendingOrders={pendingOrdersCount}
                    revenue={totalRevenue}
                    nextMatch={nextMatch}
                    newsCount={activeNewsCount}
                />
            </CollapsibleCard>
            <CollapsibleCard
                id="analytics"
                title="Аналітика продажів"
                action={<PeriodSwitcher value={period} />}
            >
                <AnalyticsSection period={period} analytics={shopAnalytics} />
            </CollapsibleCard>
            <DashboardTables
                teamContext={teamContext}
                recentOrders={recentOrders}
                lowStock={lowStockVariants}
                unsyncedMatches={unsyncedMatches}
            />
        </div>
    )
}