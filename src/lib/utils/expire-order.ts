"use server";

import { prisma } from "@/lib/prisma";
import { systemCancelExpiredOrder } from "@/actions/order";

const PAYMENT_TIME_LIMIT_MS = 30 * 60 * 1000;

export async function cancelExpiredOrders(userId?: string) {
  const cutoff = new Date(Date.now() - PAYMENT_TIME_LIMIT_MS);

  const expiredOrders = await prisma.order.findMany({
    where: {
      ...(userId ? { userId } : {}),
      isPaid: false,
      paymentMethod: "CARD",
      status: { notIn: ["CANCELLED", "CANCELLED_REFUND_PENDING"] },
      createdAt: { lt: cutoff },
    },
    select: { id: true },
  });

  for (const order of expiredOrders) {
    await systemCancelExpiredOrder(order.id);
  }

  return { expiredCount: expiredOrders.length };
}
