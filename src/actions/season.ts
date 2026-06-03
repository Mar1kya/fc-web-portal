"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";
import { seasonSchema } from "@/lib/schemas";
import slugify from "slugify";

export type BoundSeasonData = z.infer<typeof seasonSchema>;

export type SeasonFormState = {
  errors?: {
    name?: string[];
    sofascoreId?: string[];
    startDate?: string[];
    endDate?: string[];
  };
  message?: string | null;
  success?: boolean;
};

function revalidateSeasonPaths() {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/admin/tournaments/seasons`);
    revalidatePath(`/${locale}/matches`, "layout");
    revalidatePath(`/${locale}/news`);
    revalidatePath(`/${locale}/standings`, "layout");
  });
}

export async function createSeason(
  boundData: BoundSeasonData,
  _prevState: SeasonFormState | undefined,
  _formData: FormData,
): Promise<SeasonFormState | undefined> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = seasonSchema.safeParse(boundData);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;
    const slug = slugify(data.name.replace(/\//g, "-")).toLowerCase();

    const existing = await prisma.season.findFirst({
      where: { OR: [{ slug }, { name: data.name }] },
    });

    if (existing) {
      return {
        message: `Сезон з такою назвою або слагом (${slug}) вже існує.`,
      };
    }

    await prisma.$transaction(async (tx) => {
      if (data.isActive) {
        await tx.season.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      await tx.season.create({
        data: {
          slug,
          name: data.name,
          sofascoreId: data.sofascoreId,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
        },
      });
    });

    revalidateSeasonPaths();
    return { success: true, message: "Сезон успішно створено!" };
  } catch (error) {
    console.error("Error creating season:", error);
    return { message: "Помилка при створенні сезону" };
  }
}

export async function updateSeason(
  seasonId: string,
  boundData: BoundSeasonData,
  _prevState: SeasonFormState | undefined,
  _formData: FormData,
): Promise<SeasonFormState | undefined> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав" };
  }

  try {
    const validatedFields = seasonSchema.safeParse(boundData);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;
    const newSlug = slugify(data.name.replace(/\//g, "-")).toLowerCase();

    const existing = await prisma.season.findUnique({
      where: { id: seasonId },
    });
    if (!existing) return { message: "Сезон не знайдено" };

    if (existing.slug !== newSlug) {
      const conflict = await prisma.season.findUnique({
        where: { slug: newSlug },
      });
      if (conflict) return { message: "Сезон з такою назвою вже існує." };
    }

    await prisma.$transaction(async (tx) => {
      if (data.isActive && !existing.isActive) {
        await tx.season.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      await tx.season.update({
        where: { id: seasonId },
        data: {
          slug: newSlug,
          name: data.name,
          sofascoreId: data.sofascoreId,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
        },
      });
    });

    revalidateSeasonPaths();
    return { success: true, message: "Сезон успішно оновлено!" };
  } catch (error) {
    console.error("Error updating season:", error);
    return { message: "Помилка при оновленні сезону" };
  }
}

export async function toggleActiveSeason(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.season.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
      await tx.season.update({
        where: { id },
        data: { isActive: true },
      });
    });

    revalidateSeasonPaths();
    return { success: true, message: "Активний сезон змінено!" };
  } catch (error) {
    return { success: false, message: "Помилка при зміні статусу" };
  }
}

export async function softDeleteSeason(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const season = await prisma.season.findUnique({ where: { id } });
    if (season?.isActive) {
      return {
        success: false,
        message: "Не можна архівувати активний сезон! Зробіть активним інший.",
      };
    }

    await prisma.season.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidateSeasonPaths();
    return { success: true, message: "Сезон переміщено в архів" };
  } catch (error) {
    return { success: false, message: "Помилка архівації" };
  }
}

export async function restoreSeason(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.season.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidateSeasonPaths();
    return { success: true, message: "Сезон відновлено!" };
  } catch (error) {
    return { success: false, message: "Помилка відновлення" };
  }
}
export async function hardDeleteSeason(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.season.delete({
      where: { id },
    });

    revalidateSeasonPaths();
    return { success: true, message: "Сезон остаточно видалено!" };
  } catch (error) {
    console.error("Hard delete season error:", error);
    return {
      success: false,
      message:
        "Помилка при видаленні сезону. Можливо, до нього ще прив'язані дані.",
    };
  }
}
