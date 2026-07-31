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
            <div className="mt-4">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    <div className="xl:col-span-2 space-y-6 flex flex-col">
                        <div className="border rounded-lg bg-card p-4 sm:p-6 shadow-sm space-y-4">
                            <div className="grid grid-cols-2 gap-2 max-w-100 mb-6">
                                <div className="h-9 rounded bg-muted" />
                                <div className="h-9 rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-36 rounded bg-muted" />
                                <div className="h-11 w-full rounded bg-muted" />
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-1 space-y-6 h-full flex flex-col">
                        <div className="border rounded-lg p-6 space-y-6">
                            <div className="space-y-1.5">
                                <div className="h-5 w-40 rounded bg-muted" />
                                <div className="h-3.5 w-48 rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-44 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                                <div className="h-3 w-full rounded bg-muted" />
                                <div className="h-3 w-2/3 rounded bg-muted" />
                            </div>
                            <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-2">
                                    <div className="h-4 w-32 rounded bg-muted" />
                                    <div className="h-3 w-44 rounded bg-muted" />
                                </div>
                                <div className="h-5 w-9 rounded-full bg-muted shrink-0" />
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6 mt-4">
                        <div className="h-10 w-full sm:w-32 rounded bg-muted" />
                        <div className="h-10 w-full sm:w-48 rounded bg-muted" />
                    </div>
                </div>
            </div>
        </div>
    );
}