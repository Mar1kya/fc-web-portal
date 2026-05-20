import { getTranslations } from "next-intl/server";
import CartView from "./_components/cart-view";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Shop.CartPage.Metadata" });
    return {
        title: t("title"),
        description: t("description")
    }
}

export default function CartPage() {
    return <CartView />;
}