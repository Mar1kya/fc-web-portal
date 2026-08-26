import { SalesChart } from "./sales-chart"
import { TopProductsChart } from "./top-products-chart"
import { SizeBreakdownChart } from "./size-breakdown-chart"
import { CategoryBreakdownChart } from "./category-breakdown-chart"
import { PaymentConversionCard } from "./payment-conversion-card"
import { CustomizationStatsCard } from "./customization-stats-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsPeriod } from "@/lib/analytics/period"
import { ShopAnalytics } from "@/lib/analytics/shop-analytics"

type AnalyticsSectionProps = {
    period: AnalyticsPeriod
    analytics: ShopAnalytics
}

export function AnalyticsSection({ period, analytics }: AnalyticsSectionProps) {
    return (
        <Tabs defaultValue="sales">
            <TabsList>
                <TabsTrigger value="sales">Продажі</TabsTrigger>
                <TabsTrigger value="products">Топ товарів</TabsTrigger>
                <TabsTrigger value="sizes">Розміри</TabsTrigger>
                <TabsTrigger value="categories">Категорії</TabsTrigger>
                <TabsTrigger value="conversion">Конверсія</TabsTrigger>
            </TabsList>
            <TabsContent value="sales">
                <SalesChart data={analytics.salesTimeSeries} />
            </TabsContent>
            <TabsContent value="products">
                <TopProductsChart data={analytics.topProducts} />
            </TabsContent>
            <TabsContent value="sizes">
                <SizeBreakdownChart
                    data={analytics.sizeBreakdown}
                    period={period}
                    products={analytics.topProducts}
                />
            </TabsContent>
            <TabsContent value="categories">
                <CategoryBreakdownChart data={analytics.categoryBreakdown} />
            </TabsContent>
            <TabsContent value="conversion" className="grid gap-4 sm:grid-cols-2">
                <PaymentConversionCard data={analytics.paymentConversion} />
                <CustomizationStatsCard data={analytics.customizationStats} />
            </TabsContent>
        </Tabs>
    )
}