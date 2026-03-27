import ProfileSidebar from "./_components/profile-sidebar";

export default function ProfileLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64">
                <div className="border rounded-md bg-card top-24">
                    <ProfileSidebar />
                </div>
            </aside>
            <main className="flex-1">
                <div className="bg-card border rounded-md p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}