export default function NewseLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <main className="flex-1">
                {children}
            </main>
            <aside className="w-full md:w-64">
                SideBar
            </aside>
        </div>
    );
}