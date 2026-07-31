export default function MatchesHighlightSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
                <MatchCardSkeleton key={i} />
            ))}
        </div>
    );
}

function MatchCardSkeleton() {
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between px-1">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-3 w-10 rounded bg-muted" />
            </div>
            <div className="flex flex-col h-full rounded-xl border bg-card">
                <div className="border-b border-border/50 flex items-center justify-between h-10 p-3">
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="h-4 w-14 rounded-sm bg-muted" />
                </div>
                <div className="p-4 grow flex items-center justify-between gap-0">
                    <div className="flex flex-col gap-4 flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-muted" />
                                <div className="h-4 w-24 rounded bg-muted" />
                            </div>
                            <div className="h-5 w-4 rounded bg-muted" />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-muted" />
                                <div className="h-4 w-24 rounded bg-muted" />
                            </div>
                            <div className="h-5 w-4 rounded bg-muted" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center shrink-0 w-22 border-l border-border/50 pl-4 min-h-18 gap-1">
                        <div className="h-4 w-14 rounded bg-muted" />
                        <div className="h-3 w-10 rounded bg-muted" />
                    </div>
                </div>
                <div className="p-2">
                    <div className="h-8 w-full rounded bg-muted" />
                </div>
            </div>
        </div>
    );
}