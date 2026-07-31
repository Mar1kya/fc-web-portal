export default function Loading() {
    return (
        <>
            <MatchHeroSkeleton />
            <MatchTabsSkeleton />
        </>
    );
}

function MatchHeroSkeleton() {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-10 shadow-sm relative w-full overflow-hidden animate-pulse">
            <div className="flex flex-col items-center justify-center gap-1.5 mb-6 md:mb-10 text-center">
                <div className="h-6 w-48 md:h-8 md:w-64 rounded bg-muted" />
                <div className="h-4 w-32 md:h-5 md:w-40 rounded bg-muted mt-1" />
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-start w-full gap-2 md:gap-8">
                <div className="flex flex-col items-center w-full min-w-0">
                    <div className="w-14 h-14 md:w-28 md:h-28 rounded-full bg-muted mb-3 shrink-0" />
                    <div className="h-4 w-20 sm:h-5 sm:w-24 md:h-8 md:w-32 rounded bg-muted mb-1" />
                    <div className="h-2.5 w-16 md:h-3.5 md:w-20 rounded bg-muted mt-1" />
                    <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
                        <div className="h-5 w-24 md:h-7 md:w-32 rounded-md bg-muted/50" />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-start mt-2 md:mt-6 px-1 md:px-4 shrink-0">
                    <div className="h-10 w-16 sm:w-20 md:h-20 md:w-40 bg-muted/30 rounded-xl md:rounded-2xl border border-border/50" />
                </div>
                <div className="flex flex-col items-center w-full min-w-0">
                    <div className="w-14 h-14 md:w-28 md:h-28 rounded-full bg-muted mb-3 shrink-0" />
                    <div className="h-4 w-20 sm:h-5 sm:w-24 md:h-8 md:w-32 rounded bg-muted mb-1" />
                    <div className="h-2.5 w-16 md:h-3.5 md:w-20 rounded bg-muted mt-1" />
                    <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
                        <div className="h-5 w-24 md:h-7 md:w-32 rounded-md bg-muted/50" />
                        <div className="h-5 w-20 md:h-7 md:w-28 rounded-md bg-muted/50" />
                    </div>
                </div>
            </div>
            <div className="mt-8 md:mt-12 flex justify-center">
                <div className="h-6 w-32 md:h-8 md:w-48 rounded-full bg-muted/30 border border-border/50" />
            </div>
        </div>
    );
}

function MatchTabsSkeleton() {
    return (
        <div className="w-full mt-12 animate-pulse">
            <div className="flex w-full gap-4 sm:gap-8 border-b border-border px-0 py-3 overflow-hidden">
                <div className="h-6 w-20 rounded bg-muted" />
                <div className="h-6 w-16 rounded bg-muted" />
                <div className="h-6 w-16 rounded bg-muted" />
                <div className="h-6 w-20 rounded bg-muted" />
            </div>
            <div className="pt-8 min-h-75">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-4">
                        <div className="h-6 w-32 rounded bg-muted mb-6" />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                                <div className="h-4 w-full max-w-50 rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4 hidden md:block">
                        <div className="h-6 w-32 rounded bg-muted mb-6" />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                                <div className="h-4 w-full max-w-50 rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}