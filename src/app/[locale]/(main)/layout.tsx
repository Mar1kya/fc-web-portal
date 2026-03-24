import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import SponsorsPanel from "@/components/layout/sponsors-panel";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="container grow mx-auto py-10 px-2 2xl:px-0">
                {children}
            </main>
            <SponsorsPanel />
            <Footer />
        </div>
    )
}