"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";
import { tournamentSchema } from "@/lib/schemas";
import slugify from "slugify";

export type TournamentFormState = {
  errors?: {
    name_uk?: string[];
    name_en?: string[];
    sofascoreId?: string[];
    hasStandings?: string[];
  };
  message?: string | null;
  success?: boolean;
};
export type BoundTournamentData = z.input<typeof tournamentSchema>;

function revalidateTournamentPaths() {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/admin/tournaments/competitions`);
    revalidatePath(`/${locale}/matches`, "layout");
    revalidatePath(`/${locale}/standings`, "layout");
  });
}

export async function createTournament(
  boundData: BoundTournamentData,
  _prevState: TournamentFormState | undefined,
  _formData: FormData,
): Promise<TournamentFormState | undefined> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = tournamentSchema.safeParse(boundData);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;
    const slug = slugify(data.name_en).toLowerCase();

    const orConditions: Array<{ slug?: string; sofascoreId?: number }> = [
      { slug },
    ];
    if (data.sofascoreId != null) {
      orConditions.push({ sofascoreId: data.sofascoreId });
    }

    const existing = await prisma.tournament.findFirst({
      where: { OR: orConditions },
    });

    if (existing) {
      if (
        data.sofascoreId != null &&
        existing.sofascoreId === data.sofascoreId
      ) {
        return {
          message: `Турнір з SofaScore ID ${data.sofascoreId} вже існує (можливо, в архіві).`,
        };
      }
      return {
        message: `Турнір із назвою "${data.name_en}" (або схожим слагом) вже існує.`,
      };
    }

    await prisma.tournament.create({
      data: {
        slug,
        sofascoreId: data.sofascoreId,
        hasStandings: data.hasStandings,
        translations: {
          create: [
            { language: "uk", name: data.name_uk },
            { language: "en", name: data.name_en },
          ],
        },
      },
    });

    revalidateTournamentPaths();
    return { success: true, message: "Турнір успішно створено!" };
  } catch (error) {
    console.error("Error creating tournament:", error);
    return { message: "Помилка при створенні турніру" };
  }
}

export async function updateTournament(
  id: string,
  boundData: BoundTournamentData,
  _prevState: TournamentFormState | undefined,
  _formData: FormData,
): Promise<TournamentFormState | undefined> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав" };
  }

  try {
    const validatedFields = tournamentSchema.safeParse(boundData);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;
    const newSlug = slugify(data.name_en).toLowerCase();

    const existing = await prisma.tournament.findUnique({ where: { id } });
    if (!existing) return { message: "Турнір не знайдено" };

    if (existing.slug !== newSlug) {
      const conflict = await prisma.tournament.findUnique({
        where: { slug: newSlug },
      });
      if (conflict)
        return { message: "Турнір з такою англійською назвою вже існує." };
    }

    if (data.sofascoreId != null && data.sofascoreId !== existing.sofascoreId) {
      const conflictId = await prisma.tournament.findUnique({
        where: { sofascoreId: data.sofascoreId },
      });
      if (conflictId)
        return {
          message: `SofaScore ID ${data.sofascoreId} вже використовується іншим турніром.`,
        };
    }

    await prisma.tournament.update({
      where: { id },
      data: {
        slug: newSlug,
        sofascoreId: data.sofascoreId,
        hasStandings: data.hasStandings,
        translations: {
          upsert: [
            {
              where: {
                tournamentId_language: { tournamentId: id, language: "uk" },
              },
              update: { name: data.name_uk },
              create: { language: "uk", name: data.name_uk },
            },
            {
              where: {
                tournamentId_language: { tournamentId: id, language: "en" },
              },
              update: { name: data.name_en },
              create: { language: "en", name: data.name_en },
            },
          ],
        },
      },
    });

    revalidateTournamentPaths();
    return { success: true, message: "Турнір успішно оновлено!" };
  } catch (error) {
    console.error("Error updating tournament:", error);
    return { message: "Помилка при оновленні турніру" };
  }
}

export async function softDeleteTournament(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN")
    return { success: false, message: "Немає прав" };

  try {
    const tournamentWithMatches = await prisma.tournament.findUnique({
      where: { id },
      include: {
        _count: {
          select: { matches: true },
        },
      },
    });

    if (tournamentWithMatches && tournamentWithMatches._count.matches > 0) {
      return {
        success: false,
        message: `Неможливо архівувати: до цього турніру прив'язано ${tournamentWithMatches._count.matches} матч(ів). Спочатку видаліть або перенесіть їх.`,
      };
    }

    await prisma.tournament.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidateTournamentPaths();
    return { success: true, message: "Турнір переміщено в архів" };
  } catch (error) {
    return { success: false, message: "Помилка архівації" };
  }
}

export async function restoreTournament(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.tournament.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidateTournamentPaths();
    return { success: true, message: "Турнір успішно відновлено!" };
  } catch (error) {
    return { success: false, message: "Помилка відновлення" };
  }
}

export async function hardDeleteTournament(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.tournament.delete({ where: { id } });

    revalidateTournamentPaths();
    return {
      success: true,
      message: "Турнір остаточно видалено з бази даних!",
    };
  } catch (error) {
    console.error("Hard delete tournament error:", error);
    return {
      success: false,
      message:
        "Не вдалося видалити турнір. Можливо, до нього прив'язані матчі.",
    };
  }
}
export async function toggleTournamentStandings(
  id: string,
  hasStandings: boolean,
) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN")
    return { success: false, message: "Немає прав" };
  try {
    await prisma.tournament.update({ where: { id }, data: { hasStandings } });
    revalidateTournamentPaths();
    return { success: true, message: "Статус турнірної таблиці оновлено" };
  } catch (error) {
    return { success: false, message: "Помилка оновлення" };
  }
}
