export default function Loading() {
    return (
        <>
            <PlayerHeroSkeleton />
            <PlayerQuickStatsSkeleton />
            <ProfileTabsSkeleton />
        </>
    );
}

function PlayerHeroSkeleton() {
    return (
        <div className="flex w-full flex-col-reverse overflow-hidden rounded-lg border bg-card lg:flex-row animate-pulse">
            <div className="flex w-full flex-col items-center justify-center p-8 text-center md:p-14 lg:w-1/2 lg:items-start lg:text-left">
                <div className="mb-8 flex w-full flex-wrap items-baseline justify-center gap-4 border-b border-white/10 pb-6 lg:justify-start">
                    <div className="h-10 w-16 rounded bg-muted sm:h-12 md:h-14" />
                    <div className="h-10 w-48 rounded bg-muted sm:h-12 sm:w-64 md:h-14 md:w-80" />
                </div>
                <div className="flex w-full flex-wrap justify-center gap-8 sm:gap-10 lg:justify-start lg:gap-12">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 lg:items-start">
                            <div className="h-3.5 w-16 rounded bg-muted" />
                            <div className="h-5 w-12 rounded bg-muted" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative flex h-100 w-full items-center justify-center bg-muted md:h-125 lg:h-150 lg:w-1/2" />
        </div>
    );
}

function PlayerQuickStatsSkeleton() {
    return (
        <div className="w-full bg-card border rounded-lg mt-4 overflow-hidden animate-pulse">
            <div className="flex flex-col md:flex-row w-full divide-x divide-y md:divide-y-0 divide-border">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-center p-6 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded bg-muted" />
                            <div className="h-8 w-10 rounded bg-muted" />
                        </div>
                        <div className="h-3.5 w-20 rounded bg-muted" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProfileTabsSkeleton() {
    return (
        <div className="w-full mt-12 animate-pulse">
            <div className="flex w-full gap-6 border-b border-border px-0 py-3">
                <div className="h-5 w-16 rounded bg-muted" />
                <div className="h-5 w-16 rounded bg-muted" />
                <div className="h-5 w-20 rounded bg-muted" />
            </div>
            <div className="pt-8 min-h-75 space-y-3">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
        </div>
    );
}