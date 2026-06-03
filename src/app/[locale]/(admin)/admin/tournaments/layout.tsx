import { TournamentsNav } from "./_components/tournaments-nav";

export default function TournamentsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Турніри та Матчі</h1>
                <p className="text-muted-foreground mt-1">
                    Керування розкладом, результатами, сезонами та суперниками.
                </p>
            </div>
            <TournamentsNav />
            <main>{children}</main>
        </div>
    );
}