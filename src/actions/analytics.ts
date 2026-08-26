"use server"

import { getSizeBreakdownForProduct } from "@/lib/analytics/shop-analytics"
import type { SizeBreakdownPoint } from "@/lib/analytics/shop-analytics"
import type { AnalyticsPeriod } from "@/lib/analytics/period"

export async function getSizeBreakdownForProductAction(
    period: AnalyticsPeriod,
    productId: string
): Promise<SizeBreakdownPoint[]> {

    return getSizeBreakdownForProduct(period, productId)
}