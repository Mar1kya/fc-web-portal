import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";

export const getColorDictionary = cache(async () => {
    const locale = await getLocale();

    const colors = await prisma.color.findMany({
        where: { deletedAt: null },
        orderBy: { position: "asc" },
        select: {
            slug: true,
            hexCode: true,
            translations: { where: { language: locale }, select: { name: true } },
        },
    });

    return Object.fromEntries(
        colors.map((c) => [
            c.slug,
            { hex: c.hexCode, name: c.translations[0]?.name ?? c.slug },
        ])
    ) as Record<string, { hex: string; name: string }>;
});