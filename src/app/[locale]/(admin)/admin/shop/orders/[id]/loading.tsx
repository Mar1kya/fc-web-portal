export default function Loading() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded bg-muted" />
                        <div className="h-8 w-40 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-64 rounded bg-muted" />
                    <div className="h-3 w-40 rounded bg-muted" />
                </div>
            </div>
            <div className="border border-border/50 rounded-lg">
                <div className="p-6 pb-3">
                    <div className="h-3.5 w-56 rounded bg-muted" />
                </div>
                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-12 rounded bg-muted" />
                            <div className="h-6 w-20 rounded-md bg-muted" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-12 rounded bg-muted" />
                            <div className="h-6 w-24 rounded-md bg-muted" />
                        </div>
                        <div className="flex items-center gap-3 sm:ml-auto">
                            <div className="h-10 w-48 rounded-md bg-muted" />
                            <div className="h-10 w-40 rounded-md bg-muted" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-border/50 rounded-lg">
                        <div className="p-6 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded bg-muted" />
                                <div className="h-3.5 w-28 rounded bg-muted" />
                            </div>
                        </div>
                        <div className="px-6 pb-6 space-y-2">
                            <div className="h-4.5 w-32 rounded bg-muted" />
                            <div className="h-3.5 w-40 rounded bg-muted" />
                            <div className="h-3.5 w-28 rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="border border-border/50 rounded-lg overflow-hidden">
                <div className="border-b border-border/50 p-6 pb-4">
                    <div className="h-5 w-24 rounded bg-muted" />
                </div>
                <div className="divide-y divide-border/50">
                    {Array.from({ length: 1 }).map((_, i) => (
                        <div key={i} className="p-6 flex gap-4 items-start">
                            <div className="w-16 h-20 rounded-md bg-muted shrink-0" />
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-muted" />
                                <div className="h-3 w-32 rounded bg-muted" />
                            </div>
                            <div className="h-4 w-16 rounded bg-muted shrink-0" />
                        </div>
                    ))}
                </div>
                <div className="p-6 bg-card border-t border-border/50">
                    <div className="max-w-sm ml-auto space-y-3">
                        <div className="flex justify-between">
                            <div className="h-3.5 w-24 rounded bg-muted" />
                            <div className="h-3.5 w-16 rounded bg-muted" />
                        </div>
                        <div className="flex justify-between">
                            <div className="h-3.5 w-20 rounded bg-muted" />
                            <div className="h-3.5 w-32 rounded bg-muted" />
                        </div>
                        <div className="h-px w-full bg-border my-2" />
                        <div className="flex justify-between items-baseline">
                            <div className="h-4.5 w-16 rounded bg-muted" />
                            <div className="h-7 w-24 rounded bg-muted" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}