export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-56 rounded bg-muted" />
            <div>
                <div className="flex flex-wrap gap-1 mb-6">
                    <div className="h-9 w-28 rounded-md bg-muted" />
                    <div className="h-9 w-32 rounded-md bg-muted/50" />
                </div>
                <div className="space-y-6">
                    <div className="border border-border/50 rounded-lg p-6 space-y-4">
                        <div className="space-y-2">
                            <div className="h-5 w-40 rounded bg-muted" />
                            <div className="h-4 w-64 rounded bg-muted/50" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <div className="h-4 w-32 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-36 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end pt-2">
                            <div className="h-10 w-full sm:w-48 rounded bg-muted" />
                        </div>
                    </div>
                    <div className="border border-border/50 rounded-lg p-6 space-y-4">
                        <div className="space-y-2">
                            <div className="h-5 w-32 rounded bg-muted" />
                            <div className="h-4 w-40 rounded bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-11 w-full rounded-md bg-muted/40" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}