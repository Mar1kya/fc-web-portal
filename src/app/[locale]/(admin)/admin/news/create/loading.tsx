export default function Loading() {
    return (
        <div className="flex flex-col gap-6 pb-10 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 w-72 rounded bg-muted" />
                <div className="h-4 w-96 rounded bg-muted" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <div className="xl:col-span-2 space-y-6 flex flex-col">
                    <div className="border rounded-lg bg-card p-4 sm:p-6 shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-2 max-w-100 mb-6">
                            <div className="h-9 rounded bg-muted" />
                            <div className="h-9 rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 rounded bg-muted" />
                            <div className="h-11 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-32 rounded bg-muted" />
                            <div className="h-16 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="h-4 w-28 rounded bg-muted" />
                            <div className="h-56 w-full rounded bg-muted" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-6 space-y-4">
                            <div className="space-y-1.5">
                                <div className="h-5 w-28 rounded bg-muted" />
                                <div className="h-3.5 w-40 rounded bg-muted" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="aspect-video rounded-md bg-muted" />
                                <div className="aspect-video rounded-md bg-muted" />
                            </div>
                            <div className="h-32 w-full rounded-md border-2 border-dashed bg-muted/30" />
                        </div>
                        <div className="border rounded-lg p-6 space-y-4">
                            <div className="h-5 w-28 rounded bg-muted" />
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-36 rounded bg-muted" />
                                <div className="h-5 w-9 rounded-full bg-muted" />
                            </div>
                            <div className="h-px w-full bg-border" />
                            <div className="space-y-2">
                                <div className="h-4 w-20 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-20 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="xl:col-span-1 space-y-6 h-full">
                    <div className="border rounded-lg h-full">
                        <div className="p-6 pb-4 space-y-1.5">
                            <div className="h-5 w-24 rounded bg-muted" />
                            <div className="h-3.5 w-full rounded bg-muted" />
                            <div className="h-3.5 w-2/3 rounded bg-muted" />
                        </div>
                        <div className="px-6 pb-6 space-y-6">
                            <ChecklistSkeleton labelWidth="w-40" height="h-87.5" rows={6} />
                            <ChecklistSkeleton labelWidth="w-40" height="h-50" rows={4} />
                            <ChecklistSkeleton labelWidth="w-32" height="h-62.5" rows={4} />
                        </div>
                    </div>
                </div>
                <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6 mt-4">
                    <div className="h-10 w-full sm:w-32 rounded bg-muted" />
                    <div className="h-10 w-full sm:w-48 rounded bg-muted" />
                </div>
            </div>
        </div>
    );
}

function ChecklistSkeleton({ labelWidth, height, rows }: { labelWidth: string; height: string; rows: number }) {
    return (
        <div className="space-y-2">
            <div className={`h-4 ${labelWidth} rounded bg-muted`} />
            <div className={`${height} rounded-md border p-3 bg-muted/10 space-y-3`}>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-sm bg-muted shrink-0" />
                        <div className="h-3.5 w-3/4 rounded bg-muted" />
                    </div>
                ))}
            </div>
        </div>
    );
}