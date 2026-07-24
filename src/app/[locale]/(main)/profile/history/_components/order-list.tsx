import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import OrderHistoryCard from "./order-history-card";
import { PAGINATION } from "@/lib/constants"; 
import { Prisma } from "../../../../../../../generated/prisma";
import AppPagination from "@/components/layout/app-pagination";

type OrderListProps = {
    userId: string;
    searchParams: { [key: string]: string | string[] | undefined };
    locale: string;
};

export default async function OrderList({ userId, searchParams, locale }: OrderListProps) {
    const t = await getTranslations("ProfilePage.History");
    const status = searchParams.status as string | undefined;
    const sort = searchParams.sort as string | undefined;
    const page = searchParams.page;
    
    const pageParam = typeof page === 'string' ? parseInt(page) : 1;
    const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    const whereCondition: Prisma.OrderWhereInput = {
        userId: userId,
    };

    if (status && status !== "ALL") {
        if (status === "PAID") {
            whereCondition.isPaid = true;
        } else if (status === "PENDING") {
            whereCondition.status = "PENDING";
        } else {
            whereCondition.status = status as Prisma.EnumOrderStatusEnumFilter;
        }
    }

    const sortOrder = sort === "asc" ? "asc" : "desc";

    const [orders, totalItems] = await Promise.all([
        prisma.order.findMany({
            where: whereCondition,
            include: {
                orderItems: {
                    select: {
                        id: true,
                        quantity: true,
                        fixedPrice: true,
                        size: true,
                        product: {
                            select: {
                                media: { take: 3 },
                                translations: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: sortOrder },
            skip: (currentPage - 1) * PAGINATION.ORDERS_PER_PAGE,
            take: PAGINATION.ORDERS_PER_PAGE,
        }),
        prisma.order.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(totalItems / PAGINATION.ORDERS_PER_PAGE);

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                {t("empty")}
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                {orders.map((order) => (
                    <OrderHistoryCard key={order.id} order={order} locale={locale} />
                ))}
            </div>
            {totalPages > 1 && (
                <AppPagination totalPages={totalPages} currentPage={currentPage} />
            )}
        </>
    );
}