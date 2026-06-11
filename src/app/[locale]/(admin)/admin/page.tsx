import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { KPICards } from "./_components/kpi-cards"
import { DashboardTables } from "./_components/dashboard-tables"
import { RefreshButton } from "./_components/refresh-button"

export const metadata: Metadata = {
    title: "Дашборд",
    description: "Головна сторінка панелі керування Emerald Gang",
}

export default async function AdminDashboardPage() {
    const [
        pendingOrdersCount,
        revenueAgg,
        nextMatch,
        activeNewsCount,
        recentOrders,
        lowStockVariants,
        unsyncedMatches
    ] = await Promise.all([
        prisma.order.count({ where: { status: "PENDING", deletedAt: null } }),
        prisma.order.aggregate({ _sum: { totalPrice: true }, where: { isPaid: true } }),
        prisma.match.findFirst({ where: { status: "SCHEDULED" }, orderBy: { date: "asc" }, include: { opponent: { include: { translations: true } } } }),
        prisma.post.count({ where: { isPublished: true, deletedAt: null } }),
        prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                orderItems: {
                    include: { product: { include: { translations: true } } }
                }
            }
        }),
        prisma.productVariant.findMany({
            where: { stock: { lt: 5 } },
            orderBy: { stock: "asc" },
            include: { product: { include: { translations: true } } }
        }),
        prisma.match.findMany({
            where: {
                status: "FINISHED",
                isDetailsSynced: false,
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
        })
    ]);

    const totalRevenue = Number(revenueAgg._sum.totalPrice || 0);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Дашборд</h2>
                <div className="flex items-center space-x-2">
                    <RefreshButton />
                </div>
            </div>
            <KPICards
                pendingOrders={pendingOrdersCount}
                revenue={totalRevenue}
                nextMatch={nextMatch}
                newsCount={activeNewsCount}
            />
            <DashboardTables
                recentOrders={recentOrders}
                lowStock={lowStockVariants}
                unsyncedMatches={unsyncedMatches}
            />
        </div>
    )
}