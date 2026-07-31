import { prisma } from "@/lib/prisma";
import type { Order } from "../../../generated/prisma";

const PAYMENT_TIME_LIMIT_MS = 30 * 60 * 1000;

export async function checkAndExpireOrder<
  T extends Pick<
    Order,
    "id" | "status" | "isPaid" | "paymentMethod" | "createdAt"
  >,
>(order: T): Promise<T> {
  const isCardPayment = order.paymentMethod === "CARD";

  if (!order.isPaid && isCardPayment && order.status !== "CANCELLED") {
    const timePassedMs = Date.now() - order.createdAt.getTime();

    if (timePassedMs >= PAYMENT_TIME_LIMIT_MS) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      return { ...order, status: "CANCELLED" };
    }
  }

  return order;
}

export async function cancelExpiredOrders(userId?: string) {
  const cutoff = new Date(Date.now() - PAYMENT_TIME_LIMIT_MS);

  await prisma.order.updateMany({
    where: {
      ...(userId ? { userId } : {}),
      isPaid: false,
      paymentMethod: "CARD",
      status: { notIn: ["CANCELLED"] },
      createdAt: { lt: cutoff },
    },
    data: { status: "CANCELLED" },
  });
}

export { PAYMENT_TIME_LIMIT_MS };
