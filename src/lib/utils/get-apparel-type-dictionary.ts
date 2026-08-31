import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";

export const getApparelTypeDictionary = cache(async () => {
    const locale = await getLocale();

    const apparelTypes = await prisma.apparelType.findMany({
        where: { deletedAt: null },
        orderBy: { position: "asc" },
        select: {
            slug: true,
            translations: { where: { language: locale }, select: { name: true } },
        },
    });

    return Object.fromEntries(
        apparelTypes.map((a) => [
            a.slug,
            { name: a.translations[0]?.name ?? a.slug },
        ])
    ) as Record<string, { name: string }>;
});