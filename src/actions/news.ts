"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

export type DeleteState = {
  success?: boolean;
  message: string;
};

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
