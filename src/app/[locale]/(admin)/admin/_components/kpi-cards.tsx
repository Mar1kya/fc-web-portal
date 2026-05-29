import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Banknote, CalendarDays, Newspaper } from "lucide-react"
import { formatPrice } from "@/lib/utils" 
import { Prisma } from "../../../../../../generated/prisma";

type NextMatchWithOpponent = Prisma.MatchGetPayload<{
    include: { opponent: { include: { translations: true } } }
}>;

type KPICardsProps = {
    pendingOrders: number;
    revenue: number;
    nextMatch: NextMatchWithOpponent | null; 
    newsCount: number;
}
export function KPICards({ pendingOrders, revenue, nextMatch, newsCount }: KPICardsProps) {
    const nextMatchOpponent = nextMatch?.opponent?.translations?.[0]?.name || nextMatch?.opponent?.slug;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Нові замовлення</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingOrders}</div>
                    <p className="text-xs text-muted-foreground mt-1">Очікують відправки</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Загальний дохід</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(revenue)}</div>
                    <p className="text-xs text-muted-foreground mt-1">З оплачених замовлень</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Наступний матч</CardTitle>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold truncate" title={nextMatch ? `vs ${nextMatchOpponent}` : ""}>
                        {nextMatch ? `vs ${nextMatchOpponent}` : "Немає розкладу"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {nextMatch ? new Date(nextMatch.date).toLocaleDateString("uk-UA") : "-"}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Активні новини</CardTitle>
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{newsCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Опубліковано на порталі</p>
                </CardContent>
            </Card>
        </div>
    )
}