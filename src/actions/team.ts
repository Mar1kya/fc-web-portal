"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { LOCALES } from "@/lib/constants";
import { PlayerPosition, TeamContext } from "../../generated/prisma";
import { createPlayerSchema } from "@/lib/schemas";
import { generatePlayerSlug } from "@/lib/utils/slugify";

export type PlayerFormState = {
  errors?: {
    name_uk?: string[];
    name_en?: string[];
    number?: string[];
    position?: string[];
    teamContext?: string[];
    nationality?: string[];
  };
  message?: string | null;
  success?: boolean;
  newSlug?: string;
};

export type BoundPlayerData = {
  name_uk: string;
  bio_uk?: string;
  name_en?: string;
  bio_en?: string;
  number: number;
  position: PlayerPosition;
  teamContext: TeamContext;
  avatarUrl?: string;
  isManualAvatar: boolean;
  mediaUrls: string[];
  birthDate?: Date;
  height?: number;
  weight?: number;
  nationality?: string;
  initialMatches: number;
  initialGoals: number;
  initialAssists: number;
  initialCleanSheets: number;
  initialGoalsConceded: number;
};

export async function softDeletePlayer(id: string) {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав для виконання цієї дії" };
  }

  try {
    const player = await prisma.player.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/team`);
      revalidatePath(`/${locale}/team`);
      revalidatePath(`/${locale}/team/${player.slug}`);
      revalidatePath(`/${locale}/shop/player`);
      revalidatePath(`/${locale}/shop/player/${player.slug}`);
      revalidatePath(`/${locale}/matches`, "layout");
    });

    return {
      success: true,
      message: "Профіль гравця переміщено в архів",
    };
  } catch (error) {
    console.error("Error deleting player:", error);
    return {
      success: false,
      message: "Сталася помилка при видаленні профілю",
    };
  }
}

export async function restorePlayer(id: string) {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав для виконання цієї дії" };
  }

  try {
    const player = await prisma.player.update({
      where: { id },
      data: { deletedAt: null },
    });

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/team`);
      revalidatePath(`/${locale}/team`);
      revalidatePath(`/${locale}/team/${player.slug}`);
      revalidatePath(`/${locale}/shop/player`);
      revalidatePath(`/${locale}/shop/player/${player.slug}`);
      revalidatePath(`/${locale}/matches`, "layout");
    });

    return {
      success: true,
      message: "Профіль гравця успішно відновлено!",
    };
  } catch (error) {
    console.error("Error during player restoration:", error);
    return {
      success: false,
      message: "Сталася помилка при відновленні профілю",
    };
  }
}

export async function hardDeletePlayer(id: string) {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав для виконання цієї дії" };
  }

  try {
    const existingPlayer = await prisma.player.findUnique({
      where: { id },
    });

    if (!existingPlayer) {
      return { success: false, message: "Гравця не знайдено" };
    }

    await prisma.player.delete({
      where: { id },
    });

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/team`);
    });

    return {
      success: true,
      message: "Профіль гравця видалено назавжди",
    };
  } catch (error) {
    console.error("Error during hard deletion of player:", error);
    return {
      success: false,
      message: "Сталася помилка при остаточному видаленні",
    };
  }
}
export async function createPlayer(
  boundData: BoundPlayerData,
  _prevState: PlayerFormState | undefined,
  _formData: FormData,
): Promise<PlayerFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = createPlayerSchema.safeParse(boundData);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;

    const nameForSlug =
      data.name_en && data.name_en.trim() !== "" ? data.name_en : data.name_uk;

    const slug = generatePlayerSlug(nameForSlug, data.number);

    const existingPlayer = await prisma.player.findUnique({ where: { slug } });
    if (existingPlayer) {
      return {
        message: `Гравець з таким slug (${slug}) вже існує. Змініть ім'я або номер.`,
      };
    }

    const translations = [
      {
        language: "uk",
        name: data.name_uk,
        bio: data.bio_uk || null,
      },
    ];

    if (data.name_en && data.name_en.trim() !== "") {
      translations.push({
        language: "en",
        name: data.name_en,
        bio: data.bio_en || null,
      });
    }

    const isGoalkeeper = data.position === PlayerPosition.GOALKEEPER;
    const cleanSheets = isGoalkeeper ? data.initialCleanSheets : 0;
    const goalsConceded = isGoalkeeper ? data.initialGoalsConceded : 0;
    const goals = isGoalkeeper ? 0 : data.initialGoals;

    await prisma.player.create({
      data: {
        slug,
        number: data.number,
        position: data.position,
        teamContext: data.teamContext,
        avatar: data.avatarUrl || null,
        isManualAvatar: !!data.avatarUrl,
        birthDate: data.birthDate || null,
        height: data.height || null,
        weight: data.weight || null,
        nationality: data.nationality || null,

        initialMatches: data.initialMatches,
        initialGoals: goals,
        initialAssists: data.initialAssists,
        initialCleanSheets: cleanSheets,
        initialGoalsConceded: goalsConceded,

        translations: {
          create: translations,
        },
        media:
          data.mediaUrls && data.mediaUrls.length > 0
            ? {
                create: data.mediaUrls.map((url: string) => ({
                  url,
                  type: "IMAGE",
                })),
              }
            : undefined,
      },
    });
    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/team`);
      revalidatePath(`/${locale}/admin/team/players`);
      revalidatePath(`/${locale}/team`);
      revalidatePath(`/${locale}/shop/player`);
    });

    return {
      success: true,
      message: "Профіль гравця успішно створено!",
    };
  } catch (error) {
    console.error("Error creating player:", error);
    return {
      message: "Сталася помилка при створенні гравця",
    };
  }
}
export async function updatePlayer(
  playerId: string,
  boundData: BoundPlayerData,
  _prevState: PlayerFormState | undefined,
  _formData: FormData,
): Promise<PlayerFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = createPlayerSchema.safeParse(boundData);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;

    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
      select: { slug: true },
    });

    if (!existingPlayer) {
      return { message: "Гравця не знайдено" };
    }
    const oldSlug = existingPlayer.slug;
    const nameForSlug =
      data.name_en && data.name_en.trim() !== "" ? data.name_en : data.name_uk;
    const newSlug = generatePlayerSlug(nameForSlug, data.number);

    if (oldSlug !== newSlug) {
      const slugConflict = await prisma.player.findUnique({
        where: { slug: newSlug },
      });
      if (slugConflict) {
        return {
          message: `Гравець з таким ім'ям та номером (${newSlug}) вже існує. Змініть дані.`,
        };
      }
    }

    const translations = [
      {
        language: "uk",
        name: data.name_uk,
        bio: data.bio_uk || null,
      },
    ];

    if (data.name_en && data.name_en.trim() !== "") {
      translations.push({
        language: "en",
        name: data.name_en,
        bio: data.bio_en || null,
      });
    }

    const isGoalkeeper = data.position === PlayerPosition.GOALKEEPER;
    const cleanSheets = isGoalkeeper ? data.initialCleanSheets : 0;
    const goalsConceded = isGoalkeeper ? data.initialGoalsConceded : 0;
    const goals = isGoalkeeper ? 0 : data.initialGoals;

    await prisma.player.update({
      where: { id: playerId },
      data: {
        slug: newSlug,
        number: data.number,
        position: data.position,
        teamContext: data.teamContext,
        avatar: data.avatarUrl || null,
        isManualAvatar: data.isManualAvatar,
        birthDate: data.birthDate || null,
        height: data.height || null,
        weight: data.weight || null,
        nationality: data.nationality || null,
        initialMatches: data.initialMatches,
        initialGoals: goals,
        initialAssists: data.initialAssists,
        initialCleanSheets: cleanSheets,
        initialGoalsConceded: goalsConceded,

        translations: {
          deleteMany: {},
          create: translations,
        },
        media: {
          deleteMany: {},
          create:
            data.mediaUrls && data.mediaUrls.length > 0
              ? data.mediaUrls.map((url: string) => ({
                  url,
                  type: "IMAGE",
                }))
              : [],
        },
      },
    });
    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/team`);
      revalidatePath(`/${locale}/admin/team/players`);
      revalidatePath(`/${locale}/team`);
      revalidatePath(`/${locale}/team/${oldSlug}`);
      if (oldSlug !== newSlug) {
        revalidatePath(`/${locale}/team/${newSlug}`);
      }
      revalidatePath(`/${locale}/shop/player`);
      revalidatePath(`/${locale}/shop/player/${oldSlug}`);
      if (oldSlug !== newSlug) {
        revalidatePath(`/${locale}/shop/player/${newSlug}`);
      }
    });

    return {
      success: true,
      message: "Профіль гравця успішно оновлено!",
      newSlug,
    };
  } catch (error) {
    console.error("Error updating player:", error);
    return {
      message: "Сталася помилка при оновленні гравця",
    };
  }
}

export async function softDeleteCoach(id: string) {
    const session = await auth();

    if (!session?.user?.email || session.user.role !== "ADMIN") {
        return { success: false, message: "Немає прав для виконання цієї дії" };
    }

    try {
        const coach = await prisma.coach.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        LOCALES.forEach((locale) => {
            revalidatePath(`/${locale}/admin/team`);
            revalidatePath(`/${locale}/team`);
            revalidatePath(`/${locale}/team/staff/${coach.slug}`);
        });

        return {
            success: true,
            message: "Профіль тренера переміщено в архів",
        };
    } catch (error) {
        console.error("Error deleting coach:", error);
        return {
            success: false,
            message: "Сталася помилка при видаленні профілю",
        };
    }
}

export async function restoreCoach(id: string) {
    const session = await auth();

    if (!session?.user?.email || session.user.role !== "ADMIN") {
        return { success: false, message: "Немає прав для виконання цієї дії" };
    }

    try {
        const coach = await prisma.coach.update({
            where: { id },
            data: { deletedAt: null },
        });

        LOCALES.forEach((locale) => {
            revalidatePath(`/${locale}/admin/team`);
            revalidatePath(`/${locale}/team`);
            revalidatePath(`/${locale}/team/staff/${coach.slug}`);
        });

        return {
            success: true,
            message: "Профіль тренера успішно відновлено!",
        };
    } catch (error) {
        console.error("Error during coach restoration:", error);
        return {
            success: false,
            message: "Сталася помилка при відновленні профілю",
        };
    }
}

export async function hardDeleteCoach(id: string) {
    const session = await auth();

    if (!session?.user?.email || session.user.role !== "ADMIN") {
        return { success: false, message: "Немає прав для виконання цієї дії" };
    }

    try {
        const existingCoach = await prisma.coach.findUnique({
            where: { id },
        });

        if (!existingCoach) {
            return { success: false, message: "Співробітника не знайдено" };
        }

        await prisma.coach.delete({
            where: { id },
        });

        LOCALES.forEach((locale) => {
            revalidatePath(`/${locale}/admin/team`);
        });

        return {
            success: true,
            message: "Профіль тренера видалено назавжди",
        };
    } catch (error) {
        console.error("Error during hard deletion of coach:", error);
        return {
            success: false,
            message: "Сталася помилка при остаточному видаленні",
        };
    }
}