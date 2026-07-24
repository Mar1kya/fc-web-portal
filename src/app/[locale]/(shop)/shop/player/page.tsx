import { getTranslations } from "next-intl/server";
import H1 from "@/components/ui/heading";
import { Suspense } from "react";
import PlayersWithMerchSkeleton from "./_components/players-with-merch-skeleton";
import PlayersWithMerchSection from "./_components/players-with-merch-section";


export async function generateMetadata() {
    const t = await getTranslations("Shop.PlayersCatalog.Metadata");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function ShopByPlayerPage() {
    const t = await getTranslations("Shop.PlayersCatalog");

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col border-b border-border pb-4">
                <H1>{t("heading")}</H1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    {t("subheading")}
                </p>
            </div>
            <Suspense fallback={<PlayersWithMerchSkeleton />}>
                <PlayersWithMerchSection />
            </Suspense>
        </div>
    );
}