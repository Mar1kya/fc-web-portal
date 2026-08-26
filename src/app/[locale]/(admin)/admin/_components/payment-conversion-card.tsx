import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PaymentConversionStats } from "@/lib/analytics/shop-analytics"

type PaymentConversionCardProps = {
    data: PaymentConversionStats
}

const percentFormatter = new Intl.NumberFormat("uk-UA", {
    style: "percent",
    maximumFractionDigits: 1,
})

export function PaymentConversionCard({ data }: PaymentConversionCardProps) {
    const { paidCount, cancelledCount, pendingUnpaidCount, totalCount } = data

    const segments = [
        { label: "Оплачено", count: paidCount, color: "var(--chart-2)" },
        { label: "Скасовано", count: cancelledCount, color: "var(--destructive)" },
        { label: "Очікує оплати", count: pendingUnpaidCount, color: "var(--chart-4)" },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Конверсія оплат</CardTitle>
                <CardDescription>
                    {totalCount > 0
                        ? `${paidCount} з ${totalCount} замовлень оплачено (${percentFormatter.format(paidCount / totalCount)})`
                        : "Немає замовлень за обраний період"}
                </CardDescription>
            </CardHeader>
            {totalCount > 0 && (
                <CardContent className="flex flex-col gap-4">
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                        {segments.map((s) =>
                            s.count > 0 ? (
                                <div
                                    key={s.label}
                                    style={{ width: `${(s.count / totalCount) * 100}%`, backgroundColor: s.color }}
                                />
                            ) : null
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        {segments.map((s) => (
                            <div key={s.label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-muted-foreground">{s.label}</span>
                                </div>
                                <span className="font-medium">
                                    {s.count} ({percentFormatter.format(s.count / totalCount)})
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    )
}