"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function forceSyncStandings() {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "ADMIN") {
        return { success: false, message: "Немає прав" };
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const secret = process.env.CRON_SECRET;
        
        // Викликаємо твій API-роут
        const response = await fetch(`${baseUrl}/api/cron/sync-standings?key=${secret}`, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Помилка API");
        }

        const data = await response.json();

        revalidatePath("/admin/tournaments/standings");
        revalidatePath("/matches", "layout");
        
        return { success: true, message: `Таблиці успішно оновлено! Оброблено команд: ${data.updated || 0}` };
    } catch (error) {
        console.error("Force sync error:", error);
        return { success: false, message: "Не вдалося оновити таблиці. Перевірте CRON_SECRET та API." };
    }
}