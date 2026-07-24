export default function MatchesListSkeleton() {
    return (
        <div className="space-y-5 mt-10 animate-pulse">
            {Array.from({ length: 2 }).map((_, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                    <div className="border-b pb-2 mb-4">
                        <div className="h-7 w-40 rounded bg-muted" />
                    </div>
                    <div className="flex flex-col">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <MatchListItemSkeleton key={i} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function MatchListItemSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border border-border/50 rounded-lg bg-card/50 mb-3">
            <div className="flex items-center lg:w-50 shrink-0 gap-4 lg:gap-6">
                <div className="flex flex-col gap-1">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-14 rounded bg-muted" />
                </div>
            </div>
            <div className="flex lg:flex-col items-center lg:items-start lg:w-30 shrink-0 gap-2 lg:gap-1">
                <div className="h-4 w-12 rounded bg-muted" />
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-2.5 w-14 rounded bg-muted" />
            </div>
            <div className="flex items-center justify-between lg:justify-center flex-1 min-w-0 gap-4">
                <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
                    <div className="h-4 w-20 rounded bg-muted hidden sm:block" />
                    <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-muted" />
                </div>
                <div className="flex items-center justify-center flex-col gap-2 w-20 shrink-0">
                    <div className="h-7 w-14 rounded-md bg-muted" />
                    <div className="h-4 w-14 rounded-full bg-muted" />
                </div>
                <div className="flex items-center justify-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-muted" />
                    <div className="h-4 w-20 rounded bg-muted hidden sm:block" />
                </div>
            </div>
            <div className="flex justify-end lg:w-35 shrink-0 mt-2 lg:mt-0">
                <div className="h-9 w-full lg:w-28 rounded-md bg-muted" />
            </div>
        </div>
    );
}