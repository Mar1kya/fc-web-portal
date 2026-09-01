import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import AppPagination from "@/components/layout/app-pagination";
import { PAGINATION } from "@/lib/constants";
import GalleryCard from "./gallery-card";

export default async function Galleries({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const locale = await getLocale();
    const t = await getTranslations("GalleriesPage");

    const pageParam = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
    const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    const whereClause = {
        deletedAt: null,
    };

    const [galleries, totalItems] = await Promise.all([
        prisma.gallery.findMany({
            where: whereClause,
            orderBy: { publishedAt: "desc" },
            skip: (currentPage - 1) * PAGINATION.GALLERIES_PER_PAGE,
            take: PAGINATION.GALLERIES_PER_PAGE,
            include: {
                translations: { select: { language: true, title: true } },
                _count: { select: { media: true } },
            },
        }),
        prisma.gallery.count({ where: whereClause }),
    ]);
    const totalPages = Math.ceil(totalItems / PAGINATION.GALLERIES_PER_PAGE);

    if (galleries.length === 0) {
        return <p className="text-muted-foreground">{t("noGalleries")}</p>;
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {galleries.map((gallery) => (
                    <GalleryCard key={gallery.id} gallery={gallery} locale={locale} />
                ))}
            </div>
            <AppPagination totalPages={totalPages} currentPage={currentPage} />
        </>
    );
}