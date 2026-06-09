"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

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

async function getGalleryWithMatch(id: string) {
    return prisma.gallery.findUnique({
        where: { id },
        select: {
            slug: true,
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
        return { success: true, message: "Галерею остаточно видалено з бази даних!" };
    } catch (error) {
        console.error("Hard delete gallery error:", error);
        return { success: false, message: "Помилка при остаточному видаленні." };
    }
}