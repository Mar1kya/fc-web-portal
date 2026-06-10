"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";

function revalidateProductPaths() {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/admin/shop/products`);
    revalidatePath(`/${locale}/shop`, "layout");
  });
}

export async function softDeleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN")
    return { success: false, message: "Немає прав" };

  try {
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isArchived: true,
      },
    });

    revalidateProductPaths();
    return { success: true, message: "Товар переміщено в архів" };
  } catch {
    return { success: false, message: "Помилка архівації товару" };
  }
}

export async function restoreProduct(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: null,
        isArchived: false,
      },
    });

    revalidateProductPaths();
    return { success: true, message: "Товар успішно відновлено!" };
  } catch {
    return { success: false, message: "Помилка відновлення товару" };
  }
}

export async function hardDeleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.product.delete({ where: { id } });

    revalidateProductPaths();
    return {
      success: true,
      message: "Товар остаточно видалено з бази даних!",
    };
  } catch (error) {
    console.error("Hard delete product error:", error);
    return {
      success: false,
      message:
        "Не вдалося видалити товар. Можливо, він прив'язаний до існуючих замовлень.",
    };
  }
}
