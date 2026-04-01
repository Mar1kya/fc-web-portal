import NewsSidebar from "./_components/news-sidebar";

export default function NewsLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <main className="flex-1">
                {children}
            </main>
            <aside className="w-full md:w-64">
                <NewsSidebar />
            </aside>
        </div>
    );
}