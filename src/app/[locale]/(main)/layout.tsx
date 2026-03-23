import Header from "@/components/layout/header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="container grow mx-auto py-4">
                {children}
            </main>
        </div>
    )
}