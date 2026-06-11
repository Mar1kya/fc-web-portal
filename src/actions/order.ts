"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { OrderStatusEnum } from "../../generated/prisma";

function revalidateOrderPaths(orderId?: string) {
  revalidatePath("/admin/shop/orders");
  if (orderId) {
    revalidatePath(`/admin/shop/orders/${orderId}`);
    revalidatePath(`/shop/order/${orderId}`);
    revalidatePath("/profile/history");
  }
}

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

export async function updateOrderStatus(id: string, status: OrderStatusEnum) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
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
