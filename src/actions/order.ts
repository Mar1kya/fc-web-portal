"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { OrderStatusEnum, Prisma } from "../../generated/prisma";
import { stripe } from "@/lib/stripe";
import { LOCALES } from "@/lib/constants";
import { getTranslations } from "next-intl/server";
function revalidatePublicOrderPaths(orderId: string) {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/shop/order/${orderId}`);
    revalidatePath(`/${locale}/profile/history`);
  });
}

function revalidateAdminOrderPaths(orderId?: string) {
  revalidatePath("/admin/shop/orders");
  if (orderId) {
    revalidatePath(`/admin/shop/orders/${orderId}`);
  }
}

function revalidateOrderPaths(orderId?: string) {
  revalidateAdminOrderPaths(orderId);
  if (orderId) {
    revalidatePublicOrderPaths(orderId);
  }
}

export type CancelOrderState =
  | {
      success?: boolean;
      message?: string;
    }
  | undefined;

export type ManualOrderStatus = Exclude<
  OrderStatusEnum,
  "CANCELLED" | "CANCELLED_REFUND_PENDING"
>;

const CANCELLED_STATUSES: OrderStatusEnum[] = [
  OrderStatusEnum.CANCELLED,
  OrderStatusEnum.CANCELLED_REFUND_PENDING,
];

type CancelActor = "USER" | "ADMIN";

const allowedTransitions: Record<ManualOrderStatus, ManualOrderStatus[]> = {
  PENDING: [OrderStatusEnum.SHIPPED, OrderStatusEnum.DELIVERED],
  PAID: [OrderStatusEnum.SHIPPED, OrderStatusEnum.DELIVERED],
  SHIPPED: [OrderStatusEnum.DELIVERED],
  DELIVERED: [],
};

export async function softDeleteOrder(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidateOrderPaths(id);
    return { success: true, message: "Замовлення приховано" };
  } catch {
    return { success: false, message: "Помилка видалення замовлення" };
  }
}

export async function restoreOrder(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.order.update({
      where: { id },
      data: { deletedAt: null },
    });
    revalidateOrderPaths(id);
    return { success: true, message: "Замовлення відновлено" };
  } catch {
    return { success: false, message: "Помилка відновлення замовлення" };
  }
}

export async function updateOrderStatus(id: string, status: ManualOrderStatus) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return { success: false, message: "Замовлення не знайдено" };
    }
    if (CANCELLED_STATUSES.includes(order.status)) {
      return {
        success: false,
        message: "Неможливо змінити статус скасованого замовлення",
      };
    }

    const currentManualStatus = order.status as ManualOrderStatus;
    const allowed = allowedTransitions[currentManualStatus] ?? [];
    if (!allowed.includes(status)) {
      return {
        success: false,
        message: `Неможливо перевести замовлення зі статусу "${order.status}" у "${status}"`,
      };
    }

    await prisma.order.update({
      where: { id },
      data: { status },
    });
    revalidateOrderPaths(id);
    return { success: true, message: "Статус оновлено" };
  } catch {
    return { success: false, message: "Помилка оновлення статусу" };
  }
}

export async function updateOrderIsPaid(id: string, isPaid: boolean) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return { success: false, message: "Замовлення не знайдено" };
    }

    const isCancelled = CANCELLED_STATUSES.includes(order.status);

    if (isCancelled && !isPaid) {
      return {
        success: false,
        message:
          "Для скасованого замовлення оплата знімається через підтвердження повернення коштів",
      };
    }

    if (isCancelled && isPaid) {
      return {
        success: false,
        message: "Неможливо позначити скасоване замовлення як оплачене вручну",
      };
    }

    await prisma.order.update({
      where: { id },
      data: { isPaid },
    });
    revalidateOrderPaths(id);
    return {
      success: true,
      message: isPaid ? "Оплату підтверджено" : "Оплату скасовано",
    };
  } catch {
    return { success: false, message: "Помилка оновлення оплати" };
  }
}

export async function markRefundCompleted(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return { success: false, message: "Замовлення не знайдено" };
    }
    if (order.status !== "CANCELLED_REFUND_PENDING") {
      return {
        success: false,
        message: "Замовлення не очікує підтвердження повернення",
      };
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        refundedAt: new Date(),
        isPaid: false,
      },
    });
    revalidateOrderPaths(id);
    return { success: true, message: "Повернення коштів підтверджено" };
  } catch {
    return { success: false, message: "Помилка підтвердження повернення" };
  }
}

export async function markStockRestored(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
    if (!order) {
      return { success: false, message: "Замовлення не знайдено" };
    }
    if (
      order.status !== "CANCELLED" &&
      order.status !== "CANCELLED_REFUND_PENDING"
    ) {
      return {
        success: false,
        message: "Замовлення не скасоване",
      };
    }
    if (order.stockRestored) {
      return {
        success: false,
        message: "Товар вже позначено як повернений на склад",
      };
    }

    await prisma.$transaction(
      async (tx) => {
        for (const item of order.orderItems) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        await tx.order.update({
          where: { id },
          data: { stockRestored: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    revalidateOrderPaths(id);
    return { success: true, message: "Товар повернено на склад" };
  } catch {
    return { success: false, message: "Помилка повернення товару на склад" };
  }
}

async function restoreStockAndCancel(
  orderId: string,
  status: "CANCELLED" | "CANCELLED_REFUND_PENDING",
  cancelledBy: "USER" | "ADMIN" | "SYSTEM",
  refunded: boolean,
  restoreStock: boolean,
) {
  await prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) return;

      if (restoreStock) {
        for (const item of order.orderItems) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          cancelledBy,
          cancelledAt: new Date(),
          stockRestored: restoreStock,
          ...(refunded ? { refundedAt: new Date(), isPaid: false } : {}),
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function cancelOrder(
  orderId: string,
  actor: CancelActor,
): Promise<CancelOrderState> {
  const t = await getTranslations("Shop.OrderPage");
  const session = await auth();

  if (actor === "ADMIN") {
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return { success: false, message: "Немає прав" };
    }
  } else {
    if (!session?.user?.id) {
      return { success: false, message: t("Cancel.unauthorized") };
    }
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    return { success: false, message: t("Cancel.notFound") };
  }

  if (actor === "USER" && order.userId !== session!.user!.id) {
    return { success: false, message: t("Cancel.forbidden") };
  }

  if (
    order.status === "CANCELLED" ||
    order.status === "CANCELLED_REFUND_PENDING"
  ) {
    return { success: false, message: t("Cancel.cannotCancel") };
  }

  const isShippedOrDelivered =
    order.status === "SHIPPED" || order.status === "DELIVERED";
  if (isShippedOrDelivered && actor === "USER") {
    return { success: false, message: t("Cancel.cannotCancel") };
  }

  const restoreStock = !isShippedOrDelivered;
  const paths = () => {
    revalidatePublicOrderPaths(orderId);
    revalidateAdminOrderPaths(orderId);
  };

  if (!order.isPaid) {
    await restoreStockAndCancel(
      orderId,
      "CANCELLED",
      actor,
      false,
      restoreStock,
    );
    paths();
    return { success: true, message: t("Cancel.success") };
  }

  if (order.paymentMethod !== "CARD") {
    await restoreStockAndCancel(
      orderId,
      "CANCELLED_REFUND_PENDING",
      actor,
      false,
      restoreStock,
    );
    paths();
    return { success: true, message: t("Cancel.successRefundPending") };
  }
  if (!order.stripePaymentIntentId) {
    await restoreStockAndCancel(
      orderId,
      "CANCELLED_REFUND_PENDING",
      actor,
      false,
      restoreStock,
    );
    paths();
    return { success: true, message: t("Cancel.successRefundPending") };
  }

  try {
    await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
    });

    await restoreStockAndCancel(
      orderId,
      "CANCELLED",
      actor,
      true,
      restoreStock,
    );
    paths();
    return { success: true, message: t("Cancel.successRefunded") };
  } catch (error) {
    console.error("Stripe refund error:", error);

    await restoreStockAndCancel(
      orderId,
      "CANCELLED_REFUND_PENDING",
      actor,
      false,
      restoreStock,
    );
    paths();
    return { success: true, message: t("Cancel.successRefundPending") };
  }
}

export async function cancelOrderByUser(
  orderId: string,
): Promise<CancelOrderState> {
  return cancelOrder(orderId, "USER");
}

export async function systemCancelExpiredOrder(orderId: string) {
  await prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) return;
      if (order.status === "CANCELLED" || order.isPaid) return;

      for (const item of order.orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          stockRestored: true,
          cancelledBy: "SYSTEM",
          cancelledAt: new Date(),
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  revalidateOrderPaths(orderId);
}
