import Header from "@/components/layout/header";
import { SponsorsPanel } from "@/components/layout/sponsors-panel";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="container grow mx-auto py-4 px-2 sm:px-0">
                {children}
            </main>
            <SponsorsPanel />
        </div>
    )
}