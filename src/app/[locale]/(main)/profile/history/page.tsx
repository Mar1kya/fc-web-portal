import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import H1 from "@/components/ui/heading";
import OrderHistoryTabs from "./_components/order-history-tabs";
import LinkOrderModal from "./_components/link-order-modal";
import { redirect } from "@/i18n/navigation";
import { Suspense } from "react";
import OrderListSkeleton from "./_components/order-list-skeleton";
import OrderList from "./_components/order-list";

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
    const resolvedSearchParams = await searchParams; 

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <H1>{t("title")}</H1>
                    <p className="text-muted-foreground mt-1">
                        {t("description")}
                    </p>
                </div>
                <LinkOrderModal />
            </div>
            <OrderHistoryTabs />
            <Suspense 
                key={JSON.stringify(resolvedSearchParams)} 
                fallback={<OrderListSkeleton />}
            >
                <OrderList 
                    userId={session.user.id} 
                    searchParams={resolvedSearchParams} 
                    locale={locale} 
                />
            </Suspense>
        </div>
    );
}