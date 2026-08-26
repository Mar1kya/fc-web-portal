import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CustomizationStats } from "@/lib/analytics/shop-analytics"

type CustomizationStatsCardProps = {
    data: CustomizationStats
}

const percentFormatter = new Intl.NumberFormat("uk-UA", {
    style: "percent",
    maximumFractionDigits: 1,
})

export function CustomizationStatsCard({ data }: CustomizationStatsCardProps) {
    const { customizedCount, totalItemCount, customizedShare } = data

    return (
        <Card>
            <CardHeader>
                <CardTitle>Кастомізація</CardTitle>
                <CardDescription>Частка позицій з іменем або номером</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold tracking-tight">
                        {percentFormatter.format(customizedShare)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {customizedCount} з {totalItemCount} позицій
                    </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full"
                        style={{ width: `${Math.min(customizedShare * 100, 100)}%`, backgroundColor: "var(--chart-3)" }}
                    />
                </div>
            </CardContent>
        </Card>
    )
}