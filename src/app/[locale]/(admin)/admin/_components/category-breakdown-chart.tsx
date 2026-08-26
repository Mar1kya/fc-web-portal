"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { CategoryBreakdownPoint } from "@/lib/analytics/shop-analytics"

type CategoryBreakdownChartProps = {
    data: CategoryBreakdownPoint[]
}

const chartConfig = {
    revenue: {
        label: "Виручка",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

const currencyFormatter = new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
})

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
    const chartData = [...data].reverse()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Розподіл по категоріях</CardTitle>
                <CardDescription>Виручка по категоріях товарів за обраний період</CardDescription>
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
                                dataKey="categoryName"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={110}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        labelKey="categoryName"
                                        formatter={(value, name) => {
                                            if (name === "revenue") {
                                                return [currencyFormatter.format(Number(value)), " виручка"]
                                            }
                                            return [String(value), name]
                                        }}
                                    />
                                }
                            />
                            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}