"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { formatPrice } from "@/lib/utils"
import { TopProductPoint } from "@/lib/analytics/shop-analytics"

type TopProductsChartProps = {
    data: TopProductPoint[]
}

const chartConfig = {
    quantitySold: {
        label: "Продано",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

const MAX_LABEL_LENGTH = 22

function truncateLabel(name: string): string {
    return name.length > MAX_LABEL_LENGTH ? `${name.slice(0, MAX_LABEL_LENGTH - 1)}…` : name
}

export function TopProductsChart({ data }: TopProductsChartProps) {
    const chartData = data
        .slice(0, 10)
        .map((point) => ({
            ...point,
            label: truncateLabel(point.productName),
        }))
        .reverse()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Топ товарів</CardTitle>
                <CardDescription>Найбільш продавані товари за кількістю одиниць</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
                        Немає даних за обраний період
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="w-full"
                        style={{ height: `${Math.max(chartData.length * 36, 160)}px` }}
                    >
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ left: 12, right: 24, top: 4, bottom: 4 }}
                        >
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis
                                dataKey="label"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={140}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        labelKey="label"
                                        formatter={(value, name, item) => {
                                            if (name === "quantitySold") {
                                                const revenue = item.payload?.revenue as number | undefined
                                                return [
                                                    `${value} шт${revenue !== undefined ? ` · ${formatPrice(revenue)}` : ""}`,
                                                    " продано",
                                                ]
                                            }
                                            return [String(value), name]
                                        }}
                                    />
                                }
                            />
                            <Bar
                                dataKey="quantitySold"
                                fill="var(--color-quantitySold)"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}