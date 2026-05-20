import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import ShopMenu from "@/components/layout/shop-menu";
import SponsorsPanel from "@/components/layout/sponsors-panel";
import { getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Shop.Layout.Metadata" });

    return {
        title: {
            template: `%s | ${t("titleSuffix")}`,
            default: t("defaultTitle"),
        },
        openGraph: {
            title: {
                template: `%s | ${t("titleSuffix")}`,
                default: t("defaultTitle"),
            },
        },
    };
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <div className="flex flex-col min-h-screen">
                <div className="sticky top-0 z-50 flex flex-col w-full">
                    <Header />
                    <ShopMenu />
                </div>
                <main className="container grow mx-auto py-10 px-2 2xl:px-0">
                    {children}
                </main>
                <SponsorsPanel />
                <Footer />
            </div>
        </NextIntlClientProvider>
    );
}