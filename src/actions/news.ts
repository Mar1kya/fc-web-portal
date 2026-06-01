"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { generateSlug } from "@/lib/utils/slugify";
import { PostType, TeamContext } from "../../generated/prisma";
import { createPostSchema } from "@/lib/schemas";

export type DeleteState = {
  success?: boolean;
  message: string;
};

export type PostFormState = {
  errors?: {
    title_uk?: string[];
    content_uk?: string[];
    title_en?: string[];
    content_en?: string[];
    type?: string[];
    teamContext?: string[];
    mediaUrls?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export type BoundPostData = {
  titleUk: string;
  descriptionUk: string;
  contentUk: string;
  titleEn: string;
  descriptionEn: string;
  contentEn: string;
  type: PostType;
  teamContext: TeamContext;
  mediaUrls: string[];
  isPublished: boolean;
  selectedPlayers: string[];
  selectedCoaches: string[];
  selectedMatches: string[];
};

const LOCALES = ["uk", "en"];

export async function softDeletePost(id: string): Promise<DeleteState> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const postWithRelations = await prisma.post.findUnique({
      where: { id },
      include: {
        mentionedPlayers: { select: { slug: true } },
        mentionedCoaches: { select: { slug: true } },
        relatedMatches: { select: { slug: true } },
      },
    });

    if (!postWithRelations) {
      return { message: "Публікацію не знайдено" };
    }

    await prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    const locale = await getLocale();

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/news`);
    revalidatePath(`/${locale}/admin/news/trash`);
    revalidatePath(`/${locale}/news`);
    revalidatePath(`/${locale}`);

    postWithRelations.mentionedPlayers.forEach((player) =>
      revalidatePath(`/${locale}/team/${player.slug}`),
    );

    postWithRelations.mentionedCoaches.forEach((coach) =>
      revalidatePath(`/${locale}/team/staff/${coach.slug}`),
    );

    postWithRelations.relatedMatches.forEach((match) =>
      revalidatePath(`/${locale}/matches/${match.slug}`),
    );

    return {
      success: true,
      message: "Публікацію переміщено в кошик",
    };
  } catch (error) {
    console.error("Error during post soft deletion:", error);
    return { message: "Сталася помилка при видаленні" };
  }
}

export async function restorePost(id: string): Promise<DeleteState> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        mentionedPlayers: { select: { slug: true } },
        mentionedCoaches: { select: { slug: true } },
        relatedMatches: { select: { slug: true } },
      },
    });

    if (!existingPost) {
      return { message: "Публікацію не знайдено" };
    }

    await prisma.post.update({
      where: { id },
      data: { deletedAt: null },
    });

    const locale = await getLocale();

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/news`);
    revalidatePath(`/${locale}/admin/news/trash`);
    revalidatePath(`/${locale}/news`);
    revalidatePath(`/${locale}`);

    existingPost.mentionedPlayers.forEach((player) =>
      revalidatePath(`/${locale}/team/${player.slug}`),
    );
    existingPost.mentionedCoaches.forEach((coach) =>
      revalidatePath(`/${locale}/team/staff/${coach.slug}`),
    );
    existingPost.relatedMatches.forEach((match) =>
      revalidatePath(`/${locale}/matches/${match.slug}`),
    );

    return {
      success: true,
      message: "Публікацію успішно відновлено!",
    };
  } catch (error) {
    console.error("Error during post restoration:", error);
    return { message: "Сталася помилка при відновленні" };
  }
}
export async function hardDeletePost(id: string): Promise<DeleteState> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return { message: "Публікацію не знайдено" };
    }

    await prisma.post.delete({
      where: { id },
    });

    const locale = await getLocale();

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/news`);
    revalidatePath(`/${locale}/admin/news/trash`);

    return {
      success: true,
      message: "Публікацію видалено назавжди",
    };
  } catch (error) {
    console.error("Error during hard deletion:", error);
    return { message: "Сталася помилка при остаточному видаленні" };
  }
}

export async function createPost(
  boundData: BoundPostData,
  prevState: PostFormState | undefined,
  formData: FormData,
): Promise<PostFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const formValues = {
      title_uk: boundData.titleUk,
      description_uk: boundData.descriptionUk,
      content_uk: boundData.contentUk,
      title_en: boundData.titleEn,
      description_en: boundData.descriptionEn,
      content_en: boundData.contentEn,
      type: boundData.type,
      teamContext: boundData.teamContext,
      isPublished: boundData.isPublished,
      mentionedPlayers: boundData.selectedPlayers,
      mentionedCoaches: boundData.selectedCoaches,
      relatedMatches: boundData.selectedMatches,
      mediaUrls: boundData.mediaUrls,
      publishedAt: new Date(),
    };

    const validatedFields = createPostSchema.safeParse(formValues);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;

    const titleForSlug =
      data.title_en && data.title_en.trim() !== ""
        ? data.title_en
        : data.title_uk;
    const slug = generateSlug(titleForSlug);

    const translations = [
      {
        language: "uk",
        title: data.title_uk,
        description: data.description_uk,
        content: data.content_uk,
      },
    ];

    if (data.title_en && data.content_en) {
      translations.push({
        language: "en",
        title: data.title_en,
        description: data.description_en,
        content: data.content_en,
      });
    }

    await prisma.post.create({
      data: {
        slug,
        type: data.type,
        teamContext: data.teamContext,
        isPublished: data.isPublished,
        publishedAt: data.publishedAt,
        translations: {
          create: translations,
        },
        media:
          data.mediaUrls && data.mediaUrls.length > 0
            ? {
                create: data.mediaUrls.map((url) => ({
                  url,
                  type: "IMAGE",
                })),
              }
            : undefined,
        mentionedPlayers:
          data.mentionedPlayers && data.mentionedPlayers.length > 0
            ? {
                connect: data.mentionedPlayers.map((id) => ({ id })),
              }
            : undefined,
        mentionedCoaches:
          data.mentionedCoaches && data.mentionedCoaches.length > 0
            ? {
                connect: data.mentionedCoaches.map((id) => ({ id })),
              }
            : undefined,
        relatedMatches:
          data.relatedMatches && data.relatedMatches.length > 0
            ? {
                connect: data.relatedMatches.map((id) => ({ id })),
              }
            : undefined,
      },
    });

    const [players, coaches, matches] = await Promise.all([
      data.mentionedPlayers?.length
        ? prisma.player.findMany({
            where: { id: { in: data.mentionedPlayers } },
            select: { slug: true },
          })
        : [],
      data.mentionedCoaches?.length
        ? prisma.coach.findMany({
            where: { id: { in: data.mentionedCoaches } },
            select: { slug: true },
          })
        : [],
      data.relatedMatches?.length
        ? prisma.match.findMany({
            where: { id: { in: data.relatedMatches } },
            select: { slug: true },
          })
        : [],
    ]);

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin`);
      revalidatePath(`/${locale}/admin/news`);
      revalidatePath(`/${locale}/news`);
      revalidatePath(`/${locale}`);
      players.forEach((p) => revalidatePath(`/${locale}/team/${p.slug}`));
      coaches.forEach((c) => revalidatePath(`/${locale}/team/staff/${c.slug}`));
      matches.forEach((m) => revalidatePath(`/${locale}/matches/${m.slug}`));
    });

    return {
      success: true,
      message: "Публікацію успішно створено!",
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      message: "Сталася помилка при створенні публікації",
    };
  }
}

export async function updatePost(
  postId: string, 
  boundData: BoundPostData,
  prevState: PostFormState | undefined,
  formData: FormData
): Promise<PostFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const formValues = {
      title_uk: boundData.titleUk,
      description_uk: boundData.descriptionUk,
      content_uk: boundData.contentUk,
      title_en: boundData.titleEn,
      description_en: boundData.descriptionEn,
      content_en: boundData.contentEn,
      type: boundData.type,
      teamContext: boundData.teamContext,
      isPublished: boundData.isPublished,
      mentionedPlayers: boundData.selectedPlayers,
      mentionedCoaches: boundData.selectedCoaches,
      relatedMatches: boundData.selectedMatches,
      mediaUrls: boundData.mediaUrls,
      publishedAt: new Date(), 
    };

    const validatedFields = createPostSchema.safeParse(formValues);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;

    const titleForSlug = data.title_en && data.title_en.trim() !== "" 
      ? data.title_en 
      : data.title_uk;
    const slug = generateSlug(titleForSlug);

    const translations = [
      {
        language: "uk",
        title: data.title_uk,
        description: data.description_uk,
        content: data.content_uk,
      },
    ];

    if (data.title_en && data.content_en) {
      translations.push({
        language: "en",
        title: data.title_en,
        description: data.description_en,
        content: data.content_en,
      });
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        slug,
        type: data.type,
        teamContext: data.teamContext,
        isPublished: data.isPublished,
        translations: {
          deleteMany: {}, 
          create: translations,
        },
        media: {
          deleteMany: {},
          create: data.mediaUrls && data.mediaUrls.length > 0 
            ? data.mediaUrls.map((url) => ({ url, type: "IMAGE" }))
            : [],
        },
        mentionedPlayers: {
          set: data.mentionedPlayers && data.mentionedPlayers.length > 0
            ? data.mentionedPlayers.map((id) => ({ id }))
            : [],
        },
        mentionedCoaches: {
          set: data.mentionedCoaches && data.mentionedCoaches.length > 0
            ? data.mentionedCoaches.map((id) => ({ id }))
            : [],
        },
        relatedMatches: {
          set: data.relatedMatches && data.relatedMatches.length > 0
            ? data.relatedMatches.map((id) => ({ id }))
            : [],
        },
      },
    });

    const [players, coaches, matches] = await Promise.all([
      data.mentionedPlayers?.length ? prisma.player.findMany({ where: { id: { in: data.mentionedPlayers } }, select: { slug: true } }) : [],
      data.mentionedCoaches?.length ? prisma.coach.findMany({ where: { id: { in: data.mentionedCoaches } }, select: { slug: true } }) : [],
      data.relatedMatches?.length   ? prisma.match.findMany({ where: { id: { in: data.relatedMatches } }, select: { slug: true } }) : [],
    ]);

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin`);
      revalidatePath(`/${locale}/admin/news`);
      revalidatePath(`/${locale}/news`);
      revalidatePath(`/${locale}/news/${slug}`); 
      revalidatePath(`/${locale}`);
      players.forEach((p) => revalidatePath(`/${locale}/team/${p.slug}`));
      coaches.forEach((c) => revalidatePath(`/${locale}/team/staff/${c.slug}`));
      matches.forEach((m) => revalidatePath(`/${locale}/matches/${m.slug}`));
    });

    return {
      success: true,
      message: "Публікацію успішно оновлено!",
    };
  } catch (error) {
    console.error("Error updating post:", error);
    return {
      message: "Сталася помилка при оновленні публікації",
    };
  }
}