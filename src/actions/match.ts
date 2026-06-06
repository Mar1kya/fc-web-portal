"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { processMatchSync } from "@/lib/services/match-details.service"; 

function revalidateMatchPaths() {
    LOCALES.forEach((locale) => {
        revalidatePath(`/${locale}/admin/matches`);
        revalidatePath(`/${locale}/matches`, "layout");
    });
}

export async function forceSyncMatchDetails(matchId: string) {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "ADMIN") {
        return { success: false, message: "Немає прав" };
    }

    try {
        const result = await processMatchSync(matchId);

        if (result.success) {
            revalidateMatchPaths();
            return { success: true, message: "Деталі матчу успішно синхронізовано!" };
        } else {
            return { success: false, message: result.error || "Не вдалося синхронізувати матч" };
        }
    } catch (error) {
        console.error("Force sync error:", error);
        return { success: false, message: "Внутрішня помилка сервера при синхронізації" };
    }
}

export async function softDeleteMatch(id: string) {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "ADMIN") {
        return { success: false, message: "Немає прав" };
    }

    try {
        await prisma.match.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        revalidateMatchPaths();
        return { success: true, message: "Матч переміщено в кошик" };
    } catch {
        return { success: false, message: "Помилка архівації матчу" };
    }
}
export async function restoreMatch(id: string) {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "ADMIN") {
        return { success: false, message: "Немає прав" };
    }

    try {
        await prisma.match.update({
            where: { id },
            data: { deletedAt: null },
        });

        revalidateMatchPaths();
        return { success: true, message: "Матч успішно відновлено!" };
    } catch {
        return { success: false, message: "Помилка відновлення матчу" };
    }
}

export async function hardDeleteMatch(id: string) {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "ADMIN") {
        return { success: false, message: "Немає прав" };
    }

    try {
        await prisma.match.delete({
            where: { id },
        });

        revalidateMatchPaths();
        return { success: true, message: "Матч остаточно видалено з бази даних!" };
    } catch (error) {
        console.error("Hard delete match error:", error);
        return {
            success: false,
            message: "Помилка при остаточному видаленні.",
        };
    }
}