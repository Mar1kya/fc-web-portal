"use client"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

type AppPaginationProps = {
    totalPages: number;
    currentPage: number;
}

export default function AppPagination({ totalPages, currentPage }: AppPaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations("Pagination");

    if (totalPages <= 1) return null;

    function createPageURL(pageNumber: number | string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    function getVisiblePages() {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1 && !rangeWithDots.includes(totalPages)) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    }

    const visiblePages = getVisiblePages();

    return (
        <Pagination className="mt-8">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        text={t("Previous")}
                        href={currentPage > 1 ? createPageURL(currentPage - 1) : "#"}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        aria-disabled={currentPage <= 1}
                    />
                </PaginationItem>
                {visiblePages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }
                    const pageNumber = page as number;
                    const isCurrentPage = pageNumber === currentPage;

                    return (
                        <PaginationItem key={`page-${pageNumber}`}>
                            <PaginationLink
                                href={createPageURL(pageNumber)}
                                isActive={isCurrentPage}
                            >
                                {pageNumber}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
                <PaginationItem>
                    <PaginationNext
                        text={t("Next")}
                        href={currentPage < totalPages ? createPageURL(currentPage + 1) : "#"}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        aria-disabled={currentPage >= totalPages}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}