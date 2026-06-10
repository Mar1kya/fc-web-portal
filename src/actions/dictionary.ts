"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCALES } from "@/lib/constants";
import { dictionarySchema } from "@/lib/schemas";

export type BoundDictionaryData = z.infer<typeof dictionarySchema>;

export type DictionaryFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function updateDictionaryEntry(
  id: string,
  boundData: BoundDictionaryData,
  _prevState: DictionaryFormState | undefined,
  _formData: FormData,
): Promise<DictionaryFormState | undefined> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    const validatedFields = dictionarySchema.safeParse(boundData);
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Перевірте правильність заповнення полів",
      };
    }

    const data = validatedFields.data;

    await prisma.teamDictionary.update({
      where: { id },
      data: {
        translations: {
          upsert: [
            {
              where: {
                teamDictionaryId_language: {
                  teamDictionaryId: id,
                  language: "uk",
                },
              },
              update: { name: data.name_uk },
              create: { language: "uk", name: data.name_uk },
            },
            {
              where: {
                teamDictionaryId_language: {
                  teamDictionaryId: id,
                  language: "en",
                },
              },
              update: { name: data.name_en },
              create: { language: "en", name: data.name_en },
            },
          ],
        },
      },
    });

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/tournaments/dictionary`);
      revalidatePath(`/${locale}/standings`, "layout");
      revalidatePath(`/${locale}/matches`, "layout");
    });

    return { success: true, message: "Переклад успішно оновлено!" };
  } catch (error) {
    console.error("Dictionary update error:", error);
    return { success: false, message: "Помилка при оновленні словника" };
  }
}
