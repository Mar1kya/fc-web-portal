"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { createGallerySchema } from "@/lib/schemas";
import { z } from "zod";
import { generateGallerySlug } from "@/lib/utils/slugify";

function revalidateGalleryPaths(slug?: string, matchSlug?: string) {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/admin/gallery`);
    revalidatePath(`/${locale}/gallery`, "layout");

    if (slug) {
      revalidatePath(`/${locale}/gallery/${slug}`);
    }

    if (matchSlug) {
      revalidatePath(`/${locale}/matches/${matchSlug}`);
    }
  });
}
export type BoundGalleryData = z.input<typeof createGallerySchema>;

export type GalleryFormState = {
  errors?: {
    title_uk?: string[];
    title_en?: string[];
    coverUrl?: string[];
    mediaUrls?: string[];
    matchId?: string[];
    publishedAt?: string[];
  };
  message?: string | null;
  success?: boolean;
};

async function getGalleryWithMatch(id: string) {
  return prisma.gallery.findUnique({
    where: { id },
    select: {
      slug: true,
      matchId: true,
      match: {
        select: { slug: true },
      },
    },
  });
}

export async function softDeleteGallery(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const gallery = await getGalleryWithMatch(id);

    await prisma.gallery.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidateGalleryPaths(gallery?.slug, gallery?.match?.slug);
    return { success: true, message: "Галерею переміщено в кошик" };
  } catch {
    return { success: false, message: "Помилка архівації галереї" };
  }
}

export async function restoreGallery(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const gallery = await getGalleryWithMatch(id);

    await prisma.gallery.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidateGalleryPaths(gallery?.slug, gallery?.match?.slug);
    return { success: true, message: "Галерею успішно відновлено!" };
  } catch {
    return { success: false, message: "Помилка відновлення галереї" };
  }
}

export async function hardDeleteGallery(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const gallery = await getGalleryWithMatch(id);

    await prisma.gallery.delete({
      where: { id },
    });

    revalidateGalleryPaths(gallery?.slug, gallery?.match?.slug);
    return {
      success: true,
      message: "Галерею остаточно видалено з бази даних!",
    };
  } catch (error) {
    console.error("Hard delete gallery error:", error);
    return { success: false, message: "Помилка при остаточному видаленні." };
  }
}
export async function createGallery(
  boundData: BoundGalleryData,
  _prevState: GalleryFormState | undefined,
  _formData: FormData,
): Promise<GalleryFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = createGallerySchema.safeParse(boundData);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;
    const slug = generateGallerySlug(data.title_en, data.title_uk);

    const translations = [
      {
        language: "uk",
        title: data.title_uk,
      },
    ];

    if (data.title_en && data.title_en.trim() !== "") {
      translations.push({
        language: "en",
        title: data.title_en.trim(),
      });
    }

    let matchSlug: string | undefined = undefined;
    if (data.matchId) {
      const match = await prisma.match.findUnique({
        where: { id: data.matchId },
        select: { slug: true },
      });
      if (match) matchSlug = match.slug;
    }

    await prisma.gallery.create({
      data: {
        slug,
        coverUrl: data.coverUrl,
        matchId: data.matchId || null,
        publishedAt: data.publishedAt || new Date(),
        translations: {
          create: translations,
        },
        media: {
          create: data.mediaUrls.map((url: string) => ({
            url,
            type: "IMAGE",
          })),
        },
      },
    });

    revalidateGalleryPaths(slug, matchSlug);

    return {
      success: true,
      message: "Галерею успішно створено!",
    };
  } catch (error) {
    console.error("Error creating gallery:", error);
    return {
      message: "Сталася помилка при створенні галереї",
    };
  }
}
export async function updateGallery(
  id: string,
  boundData: BoundGalleryData,
  _prevState: GalleryFormState | undefined,
  _formData: FormData,
): Promise<GalleryFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = createGallerySchema.safeParse(boundData);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;

    const existingGallery = await getGalleryWithMatch(id);

    if (!existingGallery) {
      return { message: "Галерею не знайдено" };
    }

    let newMatchSlug: string | undefined = undefined;
    if (data.matchId && data.matchId !== existingGallery.matchId) {
      const match = await prisma.match.findUnique({
        where: { id: data.matchId },
        select: { slug: true },
      });
      if (match) newMatchSlug = match.slug;
    }

    const translations = [
      {
        language: "uk",
        title: data.title_uk,
      },
    ];

    if (data.title_en && data.title_en.trim() !== "") {
      translations.push({
        language: "en",
        title: data.title_en.trim(),
      });
    }

    await prisma.gallery.update({
      where: { id },
      data: {
        coverUrl: data.coverUrl,
        matchId: data.matchId || null,
        publishedAt: data.publishedAt || new Date(),

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
    revalidateGalleryPaths(existingGallery.slug, existingGallery.match?.slug);

    if (newMatchSlug && newMatchSlug !== existingGallery.match?.slug) {
      revalidateGalleryPaths(undefined, newMatchSlug);
    }

    return {
      success: true,
      message: "Галерею успішно оновлено!",
    };
  } catch (error) {
    console.error("Error updating gallery:", error);
    return {
      message: "Сталася помилка при оновленні галереї",
    };
  }
}
