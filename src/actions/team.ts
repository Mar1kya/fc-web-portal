"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { LOCALES, TEAM_ID } from "@/lib/constants";
import { PlayerPosition, TeamContext } from "../../generated/prisma";
import { createCoachSchema, createPlayerSchema } from "@/lib/schemas";
import { generatePlayerSlug } from "@/lib/utils/slugify";
import slugify from "slugify";

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
export type CoachFormState = {
  errors?: {
    name_uk?: string[];
    role_uk?: string[];
    teamContext?: string[];
    nationality?: string[];
  };
  message?: string | null;
  success?: boolean;
  newSlug?: string;
};

export type BoundCoachData = {
  name_uk: string;
  role_uk: string;
  bio_uk?: string;
  name_en?: string;
  role_en?: string;
  bio_en?: string;
  teamContext: TeamContext;
  avatarUrl?: string;
  mediaUrls: string[];
  birthDate?: Date;
  nationality?: string;
};

const mapPosition = (positionCode: string): PlayerPosition => {
  switch (positionCode) {
    case "G":
      return PlayerPosition.GOALKEEPER;
    case "D":
      return PlayerPosition.DEFENDER;
    case "M":
      return PlayerPosition.MIDFIELDER;
    case "F":
      return PlayerPosition.FORWARD;
    default:
      return PlayerPosition.MIDFIELDER;
  }
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

export async function createCoach(
  boundData: BoundCoachData,
  _prevState: CoachFormState | undefined,
  _formData: FormData,
): Promise<CoachFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = createCoachSchema.safeParse(boundData);

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
    const slug = slugify(nameForSlug).toLowerCase();

    const existingCoach = await prisma.coach.findUnique({ where: { slug } });
    if (existingCoach) {
      return {
        message: `Співробітник з таким slug (${slug}) вже існує. Змініть ім'я або додайте ініціал.`,
      };
    }

    const translations = [
      {
        language: "uk",
        name: data.name_uk,
        role: data.role_uk,
        bio: data.bio_uk || null,
      },
    ];

    if (data.name_en && data.name_en.trim() !== "") {
      translations.push({
        language: "en",
        name: data.name_en,
        role:
          data.role_en && data.role_en.trim() !== ""
            ? data.role_en
            : data.role_uk,
        bio: data.bio_en || null,
      });
    }

    await prisma.coach.create({
      data: {
        slug,
        teamContext: data.teamContext,
        avatar: data.avatarUrl || null,
        birthDate: data.birthDate || null,
        nationality: data.nationality || null,
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
      revalidatePath(`/${locale}/admin/team/staff`);
      revalidatePath(`/${locale}/team`);
    });

    return {
      success: true,
      message: "Профіль співробітника успішно створено!",
    };
  } catch (error) {
    console.error("Error creating coach:", error);
    return {
      message: "Сталася помилка при створенні профілю",
    };
  }
}
export async function updateCoach(
  coachId: string,
  boundData: BoundCoachData,
  _prevState: CoachFormState | undefined,
  _formData: FormData,
): Promise<CoachFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = createCoachSchema.safeParse(boundData);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;
    const existingCoach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: { slug: true },
    });

    if (!existingCoach) {
      return { message: "Співробітника не знайдено" };
    }
    const oldSlug = existingCoach.slug;
    const nameForSlug =
      data.name_en && data.name_en.trim() !== "" ? data.name_en : data.name_uk;
    const newSlug = slugify(nameForSlug).toLowerCase();

    if (oldSlug !== newSlug) {
      const slugConflict = await prisma.coach.findUnique({
        where: { slug: newSlug },
      });
      if (slugConflict) {
        return {
          message: `Співробітник з таким ім'ям (${newSlug}) вже існує. Змініть дані.`,
        };
      }
    }

    const translations = [
      {
        language: "uk",
        name: data.name_uk,
        role: data.role_uk,
        bio: data.bio_uk || null,
      },
    ];

    if (data.name_en && data.name_en.trim() !== "") {
      translations.push({
        language: "en",
        name: data.name_en,
        role:
          data.role_en && data.role_en.trim() !== ""
            ? data.role_en
            : data.role_uk,
        bio: data.bio_en || null,
      });
    }
    await prisma.coach.update({
      where: { id: coachId },
      data: {
        slug: newSlug,
        teamContext: data.teamContext,
        avatar: data.avatarUrl || null,
        birthDate: data.birthDate || null,
        nationality: data.nationality || null,
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
      revalidatePath(`/${locale}/admin/team/staff`);
      revalidatePath(`/${locale}/team`);

      revalidatePath(`/${locale}/team/staff/${oldSlug}`);
      if (oldSlug !== newSlug) {
        revalidatePath(`/${locale}/team/staff/${newSlug}`);
      }
    });

    return {
      success: true,
      message: "Профіль співробітника успішно оновлено!",
      newSlug,
    };
  } catch (error) {
    console.error("Error updating coach:", error);
    return {
      message: "Сталася помилка при оновленні профілю",
    };
  }
}

export async function executeRosterSync() {
  try {
    const response = await fetch(
      `https://sofascore.p.rapidapi.com/teams/get-squad?teamId=${TEAM_ID}`,
      {
        headers: {
          "x-rapidapi-host": "sofascore.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) throw new Error("Помилка API при отриманні складу");

    const data = await response.json();
    const playersData = data.players || [];

    if (playersData.length === 0) throw new Error("Гравців не знайдено");

    let createdCount = 0;
    let updatedCount = 0;

    const affectedSlugs: string[] = [];

    await prisma.$transaction(
      async (tx) => {
        for (const item of playersData) {
          const playerData = item.player;
          const sofascoreId = playerData.id;
          const name = playerData.name;
          const position = mapPosition(playerData.position);
          const number = Number(playerData.jerseyNumber) || 0;
          const height = playerData.height || null;
          const birthDate = playerData.dateOfBirthTimestamp
            ? new Date(playerData.dateOfBirthTimestamp * 1000)
            : null;
          const nationality = playerData.country?.alpha3 || null;
          const avatar = `https://img.sofascore.com/api/v1/player/${sofascoreId}/image`;

          const slug = generatePlayerSlug(name, number);

          const existingPlayer = await tx.player.findUnique({
            where: { sofascoreId },
          });

          if (existingPlayer) {
            const newAvatar = !existingPlayer.isManualAvatar
              ? avatar
              : existingPlayer.avatar;

            const hasChanges =
              existingPlayer.number !== number ||
              existingPlayer.position !== position ||
              existingPlayer.height !== height ||
              existingPlayer.nationality !== nationality ||
              existingPlayer.avatar !== newAvatar ||
              existingPlayer.birthDate?.getTime() !== birthDate?.getTime();

            if (hasChanges) {
              await tx.player.update({
                where: { id: existingPlayer.id },
                data: {
                  number,
                  position,
                  height,
                  birthDate,
                  nationality,
                  ...(!existingPlayer.isManualAvatar ? { avatar } : {}),
                },
              });
              updatedCount++;
              affectedSlugs.push(existingPlayer.slug);
            }
          } else {
            await tx.player.create({
              data: {
                slug,
                sofascoreId,
                number,
                position,
                height,
                birthDate,
                nationality,
                avatar,
                teamContext: TeamContext.MAIN_TEAM,
                translations: {
                  create: [
                    { language: "uk", name: name },
                    { language: "en", name: name },
                  ],
                },
              },
            });
            createdCount++;
            affectedSlugs.push(slug);
          }
        }
      },
      { maxWait: 10000, timeout: 30000 },
    );

    if (affectedSlugs.length > 0) {
      LOCALES.forEach((locale) => {
        revalidatePath(`/${locale}/admin/team`);
        revalidatePath(`/${locale}/admin/team/players`);
        revalidatePath(`/${locale}/team`);
        revalidatePath(`/${locale}/shop/player`);
        revalidatePath(`/${locale}/matches`, "layout");
        affectedSlugs.forEach((affectedSlug) => {
          revalidatePath(`/${locale}/team/${affectedSlug}`);
          revalidatePath(`/${locale}/shop/player/${affectedSlug}`);
        });
      });
    }

    return { success: true, created: createdCount, updated: updatedCount };
  } catch (error) {
    console.error("Sync Roster Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Помилка",
    };
  }
}

export async function syncPlayersRoster() {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав для виконання цієї дії" };
  }

  return await executeRosterSync();
}
