"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";
import { colorSchema, apparelTypeSchema } from "@/lib/schemas";
import slugify from "slugify";

type AttributeActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  item?: { id: string };
};

function revalidateAttributePaths() {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/admin/shop/attributes`);
    revalidatePath(`/${locale}/admin/shop/products`);
    revalidatePath(`/${locale}/shop`, "layout");
  });
}

export async function createColor(
  data: unknown,
): Promise<AttributeActionState> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  const parsed = colorSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Перевірте введені дані",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const slug = `${slugify(parsed.data.name_en, { lower: true, strict: true })}-${Math.random().toString(36).slice(2, 6)}`;
    const color = await prisma.color.create({
      data: {
        slug,
        hexCode: parsed.data.hexCode,
        translations: {
          create: [
            { language: "uk", name: parsed.data.name_uk },
            { language: "en", name: parsed.data.name_en },
          ],
        },
      },
    });
    revalidateAttributePaths();
    return { success: true, message: "Колір додано", item: { id: color.id } };
  } catch {
    return { success: false, message: "Помилка створення кольору" };
  }
}

export async function deleteColor(id: string): Promise<AttributeActionState> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  const productsCount = await prisma.product.count({ where: { colorId: id } });
  if (productsCount > 0) {
    return {
      success: false,
      message: `Колір використовується у ${productsCount} товар(ах). Спочатку зніміть прив'язку.`,
    };
  }

  try {
    await prisma.color.delete({ where: { id } });
    revalidateAttributePaths();
    return { success: true, message: "Колір видалено" };
  } catch {
    return { success: false, message: "Помилка видалення кольору" };
  }
}

export async function createApparelType(
  data: unknown,
): Promise<AttributeActionState> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  const parsed = apparelTypeSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Перевірте введені дані",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const slug = `${slugify(parsed.data.name_en, { lower: true, strict: true })}-${Math.random().toString(36).slice(2, 6)}`;
    const apparelType = await prisma.apparelType.create({
      data: {
        slug,
        translations: {
          create: [
            { language: "uk", name: parsed.data.name_uk },
            { language: "en", name: parsed.data.name_en },
          ],
        },
      },
    });
    revalidateAttributePaths();
    return {
      success: true,
      message: "Тип одягу додано",
      item: { id: apparelType.id },
    };
  } catch {
    return { success: false, message: "Помилка створення типу одягу" };
  }
}

export async function deleteApparelType(
  id: string,
): Promise<AttributeActionState> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  const productsCount = await prisma.product.count({
    where: { apparelTypeId: id },
  });
  if (productsCount > 0) {
    return {
      success: false,
      message: `Тип одягу використовується у ${productsCount} товар(ах). Спочатку зніміть прив'язку.`,
    };
  }

  try {
    await prisma.apparelType.delete({ where: { id } });
    revalidateAttributePaths();
    return { success: true, message: "Тип одягу видалено" };
  } catch {
    return { success: false, message: "Помилка видалення типу одягу" };
  }
}
