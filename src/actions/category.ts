"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";
import slugify from "slugify";
import { categorySchema } from "@/lib/schemas";

export type CategoryFormState = {
  errors?: {
    name_uk?: string[];
    name_en?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export type BoundCategoryData = z.input<typeof categorySchema>;

function revalidateCategoryPaths() {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/admin/shop/categories`);
    revalidatePath(`/${locale}/shop`, "layout");
  });
}

export async function createCategory(
  boundData: BoundCategoryData,
  _prevState: CategoryFormState | undefined,
  _formData: FormData,
): Promise<CategoryFormState | undefined> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = categorySchema.safeParse(boundData);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;
    const slug = slugify(data.name_en).toLowerCase();

    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return {
        message: `Категорія із назвою "${data.name_en}" (або схожим слагом) вже існує.`,
      };
    }

    await prisma.category.create({
      data: {
        slug,
        translations: {
          create: [
            { language: "uk", name: data.name_uk },
            { language: "en", name: data.name_en },
          ],
        },
      },
    });

    revalidateCategoryPaths();
    return { success: true, message: "Категорію успішно створено!" };
  } catch (error) {
    console.error("Error creating category:", error);
    return { message: "Помилка при створенні категорії" };
  }
}

export async function updateCategory(
  id: string,
  boundData: BoundCategoryData,
  _prevState: CategoryFormState | undefined,
  _formData: FormData,
): Promise<CategoryFormState | undefined> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав" };
  }

  try {
    const validatedFields = categorySchema.safeParse(boundData);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;
    const newSlug = slugify(data.name_en).toLowerCase();

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return { message: "Категорію не знайдено" };

    if (existing.slug !== newSlug) {
      const conflict = await prisma.category.findUnique({
        where: { slug: newSlug },
      });
      if (conflict)
        return { message: "Категорія з такою англійською назвою вже існує." };
    }

    await prisma.category.update({
      where: { id },
      data: {
        slug: newSlug,
        translations: {
          upsert: [
            {
              where: {
                categoryId_language: { categoryId: id, language: "uk" },
              },
              update: { name: data.name_uk },
              create: { language: "uk", name: data.name_uk },
            },
            {
              where: {
                categoryId_language: { categoryId: id, language: "en" },
              },
              update: { name: data.name_en },
              create: { language: "en", name: data.name_en },
            },
          ],
        },
      },
    });

    revalidateCategoryPaths();
    return { success: true, message: "Категорію успішно оновлено!" };
  } catch (error) {
    console.error("Error updating category:", error);
    return { message: "Помилка при оновленні категорії" };
  }
}

export async function softDeleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN")
    return { success: false, message: "Немає прав" };

  try {
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (categoryWithProducts && categoryWithProducts._count.products > 0) {
      return {
        success: false,
        message: `Неможливо архівувати: до цієї категорії прив'язано ${categoryWithProducts._count.products} товар(ів). Спочатку видаліть або перенесіть їх.`,
      };
    }

    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidateCategoryPaths();
    return { success: true, message: "Категорію переміщено в архів" };
  } catch {
    return { success: false, message: "Помилка архівації" };
  }
}

export async function restoreCategory(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidateCategoryPaths();
    return { success: true, message: "Категорію успішно відновлено!" };
  } catch {
    return { success: false, message: "Помилка відновлення" };
  }
}

export async function hardDeleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.category.delete({ where: { id } });

    revalidateCategoryPaths();
    return {
      success: true,
      message: "Категорію остаточно видалено з бази даних!",
    };
  } catch (error) {
    console.error("Hard delete category error:", error);
    return {
      success: false,
      message:
        "Не вдалося видалити категорію. Можливо, до неї прив'язані товари.",
    };
  }
}
