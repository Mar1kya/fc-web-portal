export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b pb-6 border-border">
                <div className="space-y-2">
                    <div className="h-8 w-64 rounded bg-muted" />
                    <div className="h-4 w-48 rounded bg-muted" />
                </div>
                <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-muted/20 p-3 sm:px-4 rounded-xl border border-border/50 w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-14 rounded bg-muted" />
                            <div className="h-7 w-20 rounded-md bg-muted" />
                        </div>
                        <div className="hidden sm:block w-px h-5 bg-border" />
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-20 rounded bg-muted" />
                            <div className="h-7 w-24 rounded-md bg-muted" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-border/50 rounded-xl p-6 bg-card space-y-3">
                        <div className="h-3.5 w-24 rounded bg-muted" />
                        <div className="h-4 w-32 rounded bg-muted" />
                        <div className="h-3.5 w-28 rounded bg-muted" />
                    </div>
                ))}
            </div>
            <div className="border border-border/50 rounded-xl overflow-hidden">
                <div className="border-b border-border/50 p-6">
                    <div className="h-5 w-32 rounded bg-muted" />
                </div>
                <div className="divide-y divide-border/50">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="p-6 flex gap-4 items-start">
                            <div className="w-16 h-20 rounded-md bg-muted shrink-0" />
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-muted" />
                                <div className="h-3.5 w-32 rounded bg-muted" />
                            </div>
                            <div className="h-4 w-16 rounded bg-muted shrink-0" />
                        </div>
                    ))}
                </div>
                <div className="p-6 border-t border-border/50">
                    <div className="max-w-sm ml-auto space-y-3">
                        <div className="flex justify-between">
                            <div className="h-4 w-20 rounded bg-muted" />
                            <div className="h-4 w-16 rounded bg-muted" />
                        </div>
                        <div className="flex justify-between">
                            <div className="h-4 w-28 rounded bg-muted" />
                            <div className="h-4 w-6 rounded bg-muted" />
                        </div>
                        <div className="h-px w-full bg-border my-2" />
                        <div className="flex justify-between items-baseline">
                            <div className="h-4 w-16 rounded bg-muted" />
                            <div className="h-7 w-24 rounded bg-muted" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}