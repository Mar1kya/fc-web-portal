"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";
import slugify from "slugify";
import { opponentSchema } from "@/lib/schemas";

export type BoundOpponentData = z.input<typeof opponentSchema>;

export type OpponentFormState = {
  errors?: {
    name_uk?: string[];
    name_en?: string[];
    sofascoreId?: string[];
    logoUrl?: string[];
  };
  message?: string | null;
  success?: boolean;
};

function revalidateOpponentPaths() {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/admin/tournaments/opponents`);
    revalidatePath(`/${locale}/admin/tournaments/opponents/archive`);
    revalidatePath(`/${locale}/matches`, "layout");
  });
}

export async function createOpponent(
  boundData: BoundOpponentData,
  _prevState: OpponentFormState | undefined,
  _formData: FormData,
): Promise<OpponentFormState | undefined> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = opponentSchema.safeParse(boundData);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;
    const slug = slugify(data.name_en, { lower: true, strict: true });

    const orConditions: Array<{
      slug?: string;
      sofascoreId?: number;
    }> = [{ slug }];

    if (data.sofascoreId != null) {
      orConditions.push({ sofascoreId: data.sofascoreId });
    }

    const existing = await prisma.opponent.findFirst({
      where: { OR: orConditions },
    });

    if (existing) {
      if (
        data.sofascoreId != null &&
        existing.sofascoreId === data.sofascoreId
      ) {
        return {
          message: `Суперник з SofaScore ID ${data.sofascoreId} вже існує (можливо, в архіві).`,
        };
      }
      return {
        message: `Суперник із такою назвою або слагом (${slug}) вже існує.`,
      };
    }

    await prisma.opponent.create({
      data: {
        slug,
        sofascoreId: data.sofascoreId,
        logoUrl: data.logoUrl,
        translations: {
          create: [
            { language: "uk", name: data.name_uk },
            { language: "en", name: data.name_en },
          ],
        },
      },
    });

    revalidateOpponentPaths();
    return { success: true, message: "Суперника успішно створено!" };
  } catch (error) {
    console.error("Error creating opponent:", error);
    return { message: "Помилка при створенні суперника" };
  }
}

export async function updateOpponent(
  opponentId: string,
  boundData: BoundOpponentData,
  _prevState: OpponentFormState | undefined,
  _formData: FormData,
): Promise<OpponentFormState | undefined> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав" };
  }

  try {
    const validatedFields = opponentSchema.safeParse(boundData);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;
    const newSlug = slugify(data.name_en, { lower: true, strict: true });

    const existing = await prisma.opponent.findUnique({
      where: { id: opponentId },
    });
    if (!existing) return { message: "Суперника не знайдено" };

    if (existing.slug !== newSlug) {
      const conflict = await prisma.opponent.findUnique({
        where: { slug: newSlug },
      });
      if (conflict)
        return { message: "Суперник з такою англійською назвою вже існує." };
    }

    if (data.sofascoreId != null && data.sofascoreId !== existing.sofascoreId) {
      const conflictId = await prisma.opponent.findUnique({
        where: { sofascoreId: data.sofascoreId },
      });
      if (conflictId) {
        return {
          message: `SofaScore ID ${data.sofascoreId} вже використовується іншим суперником (перевірте архів).`,
        };
      }
    }

    await prisma.opponent.update({
      where: { id: opponentId },
      data: {
        slug: newSlug,
        sofascoreId: data.sofascoreId,
        logoUrl: data.logoUrl,
        translations: {
          upsert: [
            {
              where: { opponentId_language: { opponentId, language: "uk" } },
              update: { name: data.name_uk },
              create: { language: "uk", name: data.name_uk },
            },
            {
              where: { opponentId_language: { opponentId, language: "en" } },
              update: { name: data.name_en },
              create: { language: "en", name: data.name_en },
            },
          ],
        },
      },
    });

    revalidateOpponentPaths();
    return { success: true, message: "Дані суперника успішно оновлено!" };
  } catch (error) {
    console.error("Error updating opponent:", error);
    return { message: "Помилка при оновленні суперника" };
  }
}

export async function softDeleteOpponent(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.opponent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidateOpponentPaths();
    return { success: true, message: "Суперника переміщено в кошик" };
  } catch {
    return { success: false, message: "Помилка архівації суперника" };
  }
}

export async function restoreOpponent(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.opponent.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidateOpponentPaths();
    return { success: true, message: "Суперника успішно відновлено!" };
  } catch {
    return { success: false, message: "Помилка відновлення суперника" };
  }
}

export async function hardDeleteOpponent(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const matchesCount = await prisma.match.count({
      where: { opponentId: id },
    });

    if (matchesCount > 0) {
      return {
        success: false,
        message: `Неможливо видалити суперника: до нього прив'язано ${matchesCount} матч(ів). Спочатку видаліть або відредагуйте ці матчі.`,
      };
    }
    await prisma.opponent.delete({
      where: { id },
    });

    revalidateOpponentPaths();
    return {
      success: true,
      message: "Суперника остаточно видалено з бази даних!",
    };
  } catch (error) {
    console.error("Hard delete opponent error:", error);
    return {
      success: false,
      message: "Невідома помилка при остаточному видаленні.",
    };
  }
}
