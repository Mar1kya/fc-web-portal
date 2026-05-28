import { getTranslations } from "next-intl/server";
import H1 from "@/components/ui/heading";
import { getCheckoutInitialData } from "@/actions/checkout";
import CheckoutForm from "./_components/checkout-form";

export async function generateMetadata({ params }: {params: Promise<{ locale: string }>}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Shop.CheckoutPage.Metadata" });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function CheckoutPage() {
    const t = await getTranslations("Shop.CheckoutPage");
        const initialData = await getCheckoutInitialData();

    return (
        <div className="space-y-8">
            <div className="border-b border-border pb-4">
                <H1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
                    {t("title")}
                </H1>
            </div>
            <CheckoutForm initialData={initialData} />
        </div>
    );
}