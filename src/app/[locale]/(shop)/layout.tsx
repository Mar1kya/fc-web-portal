import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import ShopMenu from "@/components/layout/shop-menu";
import SponsorsPanel from "@/components/layout/sponsors-panel";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
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
    );
}