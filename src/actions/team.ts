"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth" 
import { LOCALES } from "@/lib/constants" 

export async function softDeletePlayer(id: string) {
    const session = await auth();

    if (!session?.user?.email || session.user.role !== "ADMIN") {
        return { success: false, message: "Немає прав для виконання цієї дії" };
    }

   try {
        const player = await prisma.player.update({
            where: { id },
            data: { deletedAt: new Date() }
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