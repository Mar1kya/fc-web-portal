import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/utils" 
import { OrderStatusEnum, PaymentMethodEnum, Prisma } from "../../../../../../generated/prisma"

type OrderWithItems = Prisma.OrderGetPayload<{
    include: {
        orderItems: {
            include: { product: { include: { translations: true } } }
        }
    }
}>;

type VariantWithProduct = Prisma.ProductVariantGetPayload<{
    include: { product: { include: { translations: true } } }
}>;

type MatchWithOpponent = Prisma.MatchGetPayload<{
    include: { opponent: { include: { translations: true } } } 
}>;

type DashboardTablesProps = {
    recentOrders: OrderWithItems[];
    lowStock: VariantWithProduct[];
    unsyncedMatches: MatchWithOpponent[];
}

const statusTranslations: Record<OrderStatusEnum, string> = {
    PENDING: "Очікує",
    PAID: "Оплачено",
    SHIPPED: "Відправлено",
    DELIVERED: "Доставлено",
    CANCELLED: "Скасовано"
};

export function DashboardTables({ recentOrders, lowStock, unsyncedMatches }: DashboardTablesProps) {
    return (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4 flex flex-col min-w-0 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between shrink-0">
                    <div>
                        <CardTitle>Останні замовлення</CardTitle>
                        <CardDescription>Останні 10 транзакцій фаншопу.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/shop/orders">Всі замовлення</Link>
                    </Button>
                </CardHeader>
                <CardContent className="flex-1">
                    <Table className="min-w-162.5">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Клієнт</TableHead>
                                <TableHead>Товари</TableHead>
                                <TableHead>Сума</TableHead>
                                <TableHead>Статуси</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center">Немає замовлень</TableCell></TableRow>
                            ) : (
                                recentOrders.map((order) => {
                                    let paymentBadgeText = "";
                                    let paymentBadgeClass = "";
                                    const isCardPayment = order.paymentMethod === PaymentMethodEnum.CARD;

                                    if (order.isPaid) {
                                        paymentBadgeText = "Оплачено";
                                        paymentBadgeClass = "bg-emerald-600 hover:bg-emerald-600 text-white";
                                    } else if (order.status === OrderStatusEnum.CANCELLED) {
                                        paymentBadgeText = "Скасовано";
                                        paymentBadgeClass = "bg-destructive/10 text-destructive";
                                    } else if (isCardPayment) {
                                        paymentBadgeText = "Не оплачено";
                                        paymentBadgeClass = "bg-amber-500/10 text-amber-500";
                                    } else {
                                        paymentBadgeText = "Оплата при отриманні";
                                        paymentBadgeClass = "bg-blue-500/10 text-blue-500";
                                    }
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {order.firstName} {order.lastName}
                                            </TableCell>
                                            <TableCell className="max-w-50">
                                                <div className="flex flex-col gap-3">
                                                    {order.orderItems.map((item) => (
                                                        <div key={item.id} className="flex flex-col gap-1">
                                                            <span className="text-xs text-muted-foreground truncate" title={item.product.translations[0]?.name}>
                                                                {item.quantity}x {item.product.translations[0]?.name || "Товар"} ({item.size})
                                                            </span>
                                                            {(item.customName || item.customNumber) && (
                                                                <div className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-600/10 w-fit px-1.5 py-0.5 rounded-sm border border-emerald-600/20 tracking-wider">
                                                                    {item.customName} {item.customNumber && `#${item.customNumber}`}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap font-medium">
                                                {formatPrice(Number(order.totalPrice))}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] uppercase text-muted-foreground w-12">Замовл:</span>
                                                        <Badge
                                                            variant={order.status === OrderStatusEnum.CANCELLED ? "destructive" : "secondary"}
                                                            className={cn(
                                                                "h-6 text-[10px] font-bold uppercase tracking-wider px-2 border-none rounded-md",
                                                                order.status !== OrderStatusEnum.CANCELLED && "bg-emerald-600/10 text-emerald-600"
                                                            )}
                                                        >
                                                            {statusTranslations[order.status]}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] uppercase text-muted-foreground w-12">Оплата:</span>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn("h-6 text-[10px] font-bold uppercase tracking-wider px-2 border-none rounded-md", paymentBadgeClass)}
                                                        >
                                                            {paymentBadgeText}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </TableCell> 
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/shop/orders/${order.id}`}>
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 min-w-0">
                <Card className="flex flex-col h-87.5">
                    <CardHeader className="shrink-0 pb-3">
                        <CardTitle className="text-red-500 flex items-center justify-between">
                            Залишки на складі
                            <Badge variant="destructive" className="rounded-full">{lowStock.length}</Badge>
                        </CardTitle>
                        <CardDescription>Товари, яких залишилося менше 5 шт.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-4">
                            {lowStock.length === 0 ? (
                                <p className="text-sm text-muted-foreground">З товарами все добре.</p>
                            ) : (
                                lowStock.map((variant) => {
                                    const productName = variant.product.translations[0]?.name || "Невідомий товар";
                                    return (
                                        <div key={variant.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="space-y-1 overflow-hidden pr-4">
                                                <p className="text-sm font-medium leading-none truncate" title={productName}>{productName}</p>
                                                <p className="text-xs text-muted-foreground">Розмір: {variant.size}</p>
                                            </div>
                                            <div className="font-bold text-red-500 shrink-0">
                                                {variant.stock} шт
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-amber-500">Очікують статистики</CardTitle>
                        <CardDescription>Зіграні матчі без подій та складів.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {unsyncedMatches.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Вся статистика заповнена.</p>
                            ) : (
                                unsyncedMatches.map((match) => {
                                    const opponentName = match.opponent.translations?.[0]?.name || match.opponent.slug;
                                    
                                    const matchTitle = match.isHomeGame 
                                        ? `Emerald Gang - ${opponentName}` 
                                        : `${opponentName} - Emerald Gang`;
                                    return (
                                        <div key={match.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{matchTitle}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(match.date).toLocaleDateString("uk-UA")}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white shrink-0">
                                                <Link href={`/admin/matches/${match.id}/edit`}>
                                                    Оновити
                                                </Link>
                                            </Button>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}