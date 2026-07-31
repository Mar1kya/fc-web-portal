export default function Loading() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-64 rounded bg-muted" />
                    <div className="h-4 w-96 rounded bg-muted" />
                </div>
                <div className="h-10 w-full sm:w-44 rounded bg-muted shrink-0" />
            </div>
            <div className="mt-4 space-y-6">
                <div className="flex flex-wrap gap-1 mb-6">
                    <div className="h-9 w-24 rounded-md bg-muted" />
                    <div className="h-9 w-48 rounded-md bg-muted/50" />
                    <div className="h-9 w-24 rounded-md bg-muted/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-border/50 rounded-lg p-6 space-y-4">
                        <div className="h-5 w-32 rounded bg-muted" />
                        <div className="space-y-2">
                            <div className="h-4 w-16 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="h-4 w-36 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-32 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="h-4 w-24 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                                <div className="h-3 w-40 rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-20 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-16 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                    </div>
                    <div className="border border-border/50 rounded-lg p-6 space-y-4">
                        <div className="h-5 w-44 rounded bg-muted" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="h-4 w-16 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-20 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-16 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-20 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                        <div className="h-12 w-full rounded-lg border bg-muted/10" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="h-4 w-28 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border border-border/50 rounded-lg p-6 space-y-4">
                    <div className="h-5 w-48 rounded bg-muted" />
                    <div className="space-y-2">
                        <div className="h-4 w-40 rounded bg-muted" />
                        <div className="h-10 w-full rounded bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-36 rounded bg-muted" />
                        <div className="h-10 w-full rounded bg-muted" />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-end border-t pt-6 mt-6">
                    <div className="h-10 w-full sm:w-32 rounded bg-muted" />
                    <div className="h-10 w-full sm:w-48 rounded bg-muted" />
                </div>
            </div>
        </div>
    );
}