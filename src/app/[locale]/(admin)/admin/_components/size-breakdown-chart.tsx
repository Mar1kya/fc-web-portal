"use client"

import { useState, useTransition } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalyticsPeriod } from "@/lib/analytics/period"
import { SizeBreakdownPoint, TopProductPoint } from "@/lib/analytics/shop-analytics"
import { getSizeBreakdownForProductAction } from "@/actions/analytics"

type SizeBreakdownChartProps = {
    data: SizeBreakdownPoint[]
    period: AnalyticsPeriod
    products: TopProductPoint[]
}

const ALL_PRODUCTS_VALUE = "__all__"

const chartConfig = {
    quantitySold: {
        label: "Продано",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

export function SizeBreakdownChart({ data, period, products }: SizeBreakdownChartProps) {
    const [selectedProductId, setSelectedProductId] = useState<string>(ALL_PRODUCTS_VALUE)
    const [productData, setProductData] = useState<SizeBreakdownPoint[] | null>(null)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState(false)

    const activeData = selectedProductId === ALL_PRODUCTS_VALUE ? data : productData ?? []
    const chartData = [...activeData].reverse()

    function handleProductChange(value: string) {
    setSelectedProductId(value)
    setError(false)

    if (value === ALL_PRODUCTS_VALUE) {
        setProductData(null)
        return
    }

    startTransition(async () => {
        try {
            const result = await getSizeBreakdownForProductAction(period, value)
            setProductData(result)
        } catch {
            setProductData([])
            setError(true)
        }
    })
}

    const selectedProductName = products.find((p) => p.productId === selectedProductId)?.productName

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <CardTitle>Розподіл по розмірах</CardTitle>
                    <CardDescription>
                        {selectedProductId === ALL_PRODUCTS_VALUE
                            ? "Кількість проданих одиниць за розміром, по всьому магазину"
                            : `Ходові розміри: ${selectedProductName ?? "товар"}`}
                    </CardDescription>
                </div>
                <Select value={selectedProductId} onValueChange={handleProductChange}>
                    <SelectTrigger className="w-full sm:w-62.5">
                        <SelectValue placeholder="Оберіть товар" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_PRODUCTS_VALUE}>Усі товари</SelectItem>
                        {products.map((product) => (
                            <SelectItem key={product.productId} value={product.productId}>
                                {product.productName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                {isPending ? (
                    <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
                        Завантаження...
                    </div>
                ) : error ? (
                    <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
                        Не вдалося завантажити дані. Спробуйте ще раз.
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
                        {selectedProductId === ALL_PRODUCTS_VALUE
                            ? "Немає даних за обраний період"
                            : "Для цього товару немає продажів за обраний період"}
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
                                dataKey="size"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={64}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        labelKey="size"
                                        formatter={(value, name) => {
                                            if (name === "quantitySold") {
                                                return [`${value} шт`, " продано"]
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