"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { formatPrice } from "@/lib/utils"
import { SalesTimeSeriesPoint } from "@/lib/analytics/shop-analytics"

type SalesChartProps = {
    data: SalesTimeSeriesPoint[]
}

const chartConfig = {
    revenue: {
        label: "Дохід",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

function formatBucketLabel(bucket: string): string {
    const isDay = bucket.length === 10
    const date = isDay ? new Date(`${bucket}T00:00:00Z`) : new Date(`${bucket}-01T00:00:00Z`)

    return isDay
        ? date.toLocaleDateString("uk-UA", { day: "numeric", month: "short", timeZone: "UTC" })
        : date.toLocaleDateString("uk-UA", { month: "short", year: "numeric", timeZone: "UTC" })
}

export function SalesChart({ data }: SalesChartProps) {
    const chartData = data.map((point) => ({
        ...point,
        label: formatBucketLabel(point.bucket),
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Динаміка продажів</CardTitle>
                <CardDescription>Дохід з оплачених замовлень</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
                        Немає даних за обраний період
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-62.5 w-full">
                        <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={24}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={64}
                                tickFormatter={(value: number) => formatPrice(value)}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        labelKey="label"
                                        formatter={(value, name) => {
                                            if (name === "revenue") {
                                                return [formatPrice(Number(value)), " дохід"]
                                            }
                                            return [String(value), name]
                                        }}
                                    />
                                }
                            />
                            <defs>
                                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <Area
                                dataKey="revenue"
                                type="monotone"
                                fill="url(#fillRevenue)"
                                stroke="var(--color-revenue)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}