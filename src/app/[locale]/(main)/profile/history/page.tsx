import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import H1 from "@/components/ui/heading";
import OrderHistoryCard from "./_components/order-history-card";
import OrderHistoryTabs from "./_components/order-history-tabs";
import LinkOrderModal from "./_components/link-order-modal";
import { PAGINATION } from "@/lib/constants";
import { Prisma } from "../../../../../../generated/prisma";
import AppPagination from "@/components/layout/app-pagination";
import { redirect } from "@/i18n/navigation";

type Props = {
    searchParams: Promise<{ status?: string; sort?: string; page?: string }>;
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "ProfilePage.History" });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function OrderHistoryPage({ searchParams, params }: Props) {
    const { locale } = await params;
    const session = await auth();

    if (!session?.user?.id) return redirect({ locale, href: "/login" });

    const t = await getTranslations("ProfilePage.History");
    const { status, sort, page } = await searchParams;
    const pageParam = typeof page === 'string' ? parseInt(page) : 1;
    const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    const whereCondition: Prisma.OrderWhereInput = {
        userId: session.user.id,
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
            orderBy: {
                createdAt: sortOrder,
            },
            skip: (currentPage - 1) * PAGINATION.ORDERS_PER_PAGE,
            take: PAGINATION.ORDERS_PER_PAGE,
        }),
        prisma.order.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(totalItems / PAGINATION.ORDERS_PER_PAGE);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <H1>
                        {t("title")}
                    </H1>
                    <p className="text-muted-foreground mt-1">
                        {t("description")}
                    </p>
                </div>
                <LinkOrderModal />
            </div>
            <OrderHistoryTabs />
            {orders.length > 0 ? (
                <>
                    <div className="flex flex-col gap-4">
                        {orders.map((order) => (
                            <OrderHistoryCard key={order.id} order={order} locale={locale} />
                        ))}
                    </div>
                    <AppPagination totalPages={totalPages} currentPage={currentPage} />
                </>
            ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    {t("empty")}
                </div>
            )}
        </div>
    );
}