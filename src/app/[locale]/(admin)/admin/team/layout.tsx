import { TeamNav } from "./_components/team-nav";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-6 pb-10">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Ростер команди</h2>
                <p className="text-muted-foreground mt-1">
                    Керування профілями гравців та тренерським штабом
                </p>
            </div>
            <TeamNav />
            <main>
                {children}
            </main>
        </div>
    );
}