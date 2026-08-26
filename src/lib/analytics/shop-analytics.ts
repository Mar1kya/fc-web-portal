import { prisma } from "@/lib/prisma";
import {
  AnalyticsPeriod,
  getGranularityForPeriod,
  getPeriodStartDate,
} from "./period";

export type SalesTimeSeriesPoint = {
  bucket: string; 
  revenue: number;
  orderCount: number;
  aov: number;
};

export type TopProductPoint = {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
};

export type SizeBreakdownPoint = {
  size: string;
  quantitySold: number;
};

export type CategoryBreakdownPoint = {
  categoryId: string;
  categoryName: string;
  revenue: number;
  quantitySold: number;
};

export type PaymentConversionStats = {
  paidCount: number;
  cancelledCount: number;
  pendingUnpaidCount: number;
  totalCount: number;
};

export type CustomizationStats = {
  customizedCount: number;
  totalItemCount: number;
  customizedShare: number; 
};

function periodWhereClauseSql(period: AnalyticsPeriod): {
  sql: string;
  startDate: Date | null;
} {
  const startDate = getPeriodStartDate(period);
  return {
    sql: startDate ? `AND o."createdAt" >= $1` : "",
    startDate,
  };
}


export async function getSalesTimeSeries(
  period: AnalyticsPeriod
): Promise<SalesTimeSeriesPoint[]> {
  const { sql: periodSql, startDate } = periodWhereClauseSql(period);
  const granularity = getGranularityForPeriod(period);
  const truncFormat = granularity === "day" ? "day" : "month";
  const bucketSlice = granularity === "day" ? 10 : 7;

  const rows = await prisma.$queryRawUnsafe<
    { bucket: Date; revenue: string; order_count: bigint }[]
  >(
    `
    SELECT
      DATE_TRUNC('${truncFormat}', o."createdAt" AT TIME ZONE 'Europe/Kyiv') AS bucket,
      SUM(o."totalPrice") AS revenue,
      COUNT(*) AS order_count
    FROM "Order" o
    WHERE o."isPaid" = true
      ${periodSql}
    GROUP BY 1
    ORDER BY 1 ASC
    `,
    ...(startDate ? [startDate] : [])
  );

  return rows.map((r) => {
    const revenue = Number(r.revenue);
    const orderCount = Number(r.order_count);
    return {
      bucket: r.bucket.toISOString().slice(0, bucketSlice),
      revenue,
      orderCount,
      aov: orderCount > 0 ? revenue / orderCount : 0,
    };
  });
}


export async function getTopProducts(
  period: AnalyticsPeriod,
  limit = 10
): Promise<TopProductPoint[]> {
  const { sql: periodSql, startDate } = periodWhereClauseSql(period);

  const rows = await prisma.$queryRawUnsafe<
    {
      product_id: string;
      product_name: string;
      quantity_sold: bigint;
      revenue: string;
    }[]
  >(
    `
    SELECT
      p.id AS product_id,
      COALESCE(pt_uk.name, pt_any.name, 'Товар') AS product_name,
      SUM(oi.quantity) AS quantity_sold,
      SUM(oi.quantity * oi."fixedPrice") AS revenue
    FROM "OrderItem" oi
    JOIN "Order" o ON o.id = oi."orderId"
    JOIN "Product" p ON p.id = oi."productId"
    LEFT JOIN "ProductTranslation" pt_uk
      ON pt_uk."productId" = p.id AND pt_uk.language = 'uk'
    LEFT JOIN LATERAL (
      SELECT name FROM "ProductTranslation" pt
      WHERE pt."productId" = p.id
      ORDER BY pt.id ASC
      LIMIT 1
    ) pt_any ON pt_uk.id IS NULL
    WHERE o."isPaid" = true
      ${periodSql}
    GROUP BY p.id, product_name
    ORDER BY quantity_sold DESC
    LIMIT ${limit}
    `,
    ...(startDate ? [startDate] : [])
  );

  return rows.map((r) => ({
    productId: r.product_id,
    productName: r.product_name,
    quantitySold: Number(r.quantity_sold),
    revenue: Number(r.revenue),
  }));
}


export async function getSizeBreakdown(
  period: AnalyticsPeriod
): Promise<SizeBreakdownPoint[]> {
  const startDate = getPeriodStartDate(period);

  const grouped = await prisma.orderItem.groupBy({
    by: ["size"],
    where: {
      order: {
        isPaid: true,
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
      size: { not: null },
    },
    _sum: { quantity: true },
  });

  return grouped
    .filter((g) => g.size !== null)
    .map((g) => ({
      size: g.size as string,
      quantitySold: g._sum.quantity ?? 0,
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold);
}

export async function getSizeBreakdownForProduct(
  period: AnalyticsPeriod,
  productId: string
): Promise<SizeBreakdownPoint[]> {
  const startDate = getPeriodStartDate(period);

  const grouped = await prisma.orderItem.groupBy({
    by: ["size"],
    where: {
      productId,
      order: {
        isPaid: true,
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
      size: { not: null },
    },
    _sum: { quantity: true },
  });

  return grouped
    .filter((g) => g.size !== null)
    .map((g) => ({
      size: g.size as string,
      quantitySold: g._sum.quantity ?? 0,
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold);
}

export async function getCategoryBreakdown(
  period: AnalyticsPeriod
): Promise<CategoryBreakdownPoint[]> {
  const { sql: periodSql, startDate } = periodWhereClauseSql(period);

  const rows = await prisma.$queryRawUnsafe<
    {
      category_id: string;
      category_name: string;
      revenue: string;
      quantity_sold: bigint;
    }[]
  >(
    `
    SELECT
      c.id AS category_id,
      COALESCE(ct_uk.name, ct_any.name, 'Без категорії') AS category_name,
      SUM(oi.quantity * oi."fixedPrice") AS revenue,
      SUM(oi.quantity) AS quantity_sold
    FROM "OrderItem" oi
    JOIN "Order" o ON o.id = oi."orderId"
    JOIN "Product" p ON p.id = oi."productId"
    JOIN "Category" c ON c.id = p."categoryId"
    LEFT JOIN "CategoryTranslation" ct_uk
      ON ct_uk."categoryId" = c.id AND ct_uk.language = 'uk'
    LEFT JOIN LATERAL (
      SELECT name FROM "CategoryTranslation" ct
      WHERE ct."categoryId" = c.id
      ORDER BY ct.id ASC
      LIMIT 1
    ) ct_any ON ct_uk.id IS NULL
    WHERE o."isPaid" = true
      ${periodSql}
    GROUP BY c.id, category_name
    ORDER BY revenue DESC
    `,
    ...(startDate ? [startDate] : [])
  );

  return rows.map((r) => ({
    categoryId: r.category_id,
    categoryName: r.category_name,
    revenue: Number(r.revenue),
    quantitySold: Number(r.quantity_sold),
  }));
}


export async function getPaymentConversion(
  period: AnalyticsPeriod
): Promise<PaymentConversionStats> {
  const startDate = getPeriodStartDate(period);

  const grouped = await prisma.order.groupBy({
    by: ["status", "isPaid"],
    where: {
      deletedAt: null,
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
    },
    _count: { _all: true },
  });

  let paidCount = 0;
  let cancelledCount = 0;
  let pendingUnpaidCount = 0;
  let totalCount = 0;

  for (const g of grouped) {
    totalCount += g._count._all;
    if (g.isPaid) {
      paidCount += g._count._all;
    } else if (g.status === "CANCELLED") {
      cancelledCount += g._count._all;
    } else {
      pendingUnpaidCount += g._count._all;
    }
  }

  return { paidCount, cancelledCount, pendingUnpaidCount, totalCount };
}


export async function getCustomizationStats(
  period: AnalyticsPeriod
): Promise<CustomizationStats> {
  const startDate = getPeriodStartDate(period);

  const baseWhere = {
    order: {
      isPaid: true,
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
    },
  };

  const [customizedCount, totalItemCount] = await Promise.all([
    prisma.orderItem.count({
      where: {
        ...baseWhere,
        OR: [{ customName: { not: null } }, { customNumber: { not: null } }],
      },
    }),
    prisma.orderItem.count({ where: baseWhere }),
  ]);

  return {
    customizedCount,
    totalItemCount,
    customizedShare: totalItemCount > 0 ? customizedCount / totalItemCount : 0,
  };
}

export type ShopAnalytics = {
  salesTimeSeries: SalesTimeSeriesPoint[];
  topProducts: TopProductPoint[];
  sizeBreakdown: SizeBreakdownPoint[];
  categoryBreakdown: CategoryBreakdownPoint[];
  paymentConversion: PaymentConversionStats;
  customizationStats: CustomizationStats;
};

export async function getShopAnalytics(
  period: AnalyticsPeriod
): Promise<ShopAnalytics> {
  const [
    salesTimeSeries,
    topProducts,
    sizeBreakdown,
    categoryBreakdown,
    paymentConversion,
    customizationStats,
  ] = await Promise.all([
    getSalesTimeSeries(period),
    getTopProducts(period),
    getSizeBreakdown(period),
    getCategoryBreakdown(period),
    getPaymentConversion(period),
    getCustomizationStats(period),
  ]);

  return {
    salesTimeSeries,
    topProducts,
    sizeBreakdown,
    categoryBreakdown,
    paymentConversion,
    customizationStats,
  };
}