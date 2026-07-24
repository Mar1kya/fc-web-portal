export default function Loading() {
    return (
        <div className="container mx-auto py-8">
            <StaffHeroSkeleton />
            <ProfileTabsSkeleton />
        </div>
    );
}

function StaffHeroSkeleton() {
    return (
        <div className="flex w-full flex-col-reverse overflow-hidden rounded-lg border bg-card xl:flex-row animate-pulse">
            <div className="flex w-full flex-col items-center justify-center p-8 text-center md:p-14 xl:w-1/2 xl:items-start xl:text-left">
                <div className="mb-8 flex w-full flex-wrap items-baseline justify-center gap-4 border-b border-border pb-6 xl:justify-start">
                    <div className="h-10 w-56 rounded bg-muted sm:h-12 sm:w-72 md:h-14 md:w-96" />
                </div>
                <div className="flex w-full flex-wrap justify-center gap-8 sm:gap-10 xl:justify-start xl:gap-12">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 xl:items-start">
                            <div className="h-3.5 w-16 rounded bg-muted" />
                            <div className="h-5 w-20 rounded bg-muted" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative flex h-100 w-full items-center justify-center bg-muted/20 md:h-125 lg:h-150 xl:w-1/2" />
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