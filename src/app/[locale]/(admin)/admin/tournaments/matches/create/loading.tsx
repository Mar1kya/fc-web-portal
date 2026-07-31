export default function Loading() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-72 rounded bg-muted" />
                    <div className="h-4 w-96 rounded bg-muted" />
                </div>
                <div className="h-10 w-full sm:w-44 rounded bg-muted shrink-0" />
            </div>
            <div className="mt-4 space-y-6">
                <div className="border rounded-lg p-6 space-y-6">
                    <div className="space-y-1.5">
                        <div className="h-6 w-56 rounded bg-muted" />
                        <div className="h-3.5 w-full max-w-md rounded bg-muted" />
                        <div className="h-3.5 w-2/3 max-w-sm rounded bg-muted" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="h-4 w-16 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-16 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-20 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-20 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-40 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                            <div className="h-3 w-56 rounded bg-muted" />
                        </div>
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4 h-fit self-end mb-1">
                            <div className="space-y-2">
                                <div className="h-4 w-28 rounded bg-muted" />
                                <div className="h-3.5 w-40 rounded bg-muted" />
                            </div>
                            <div className="h-5 w-9 rounded-full bg-muted shrink-0" />
                        </div>
                    </div>
                </div>
                <div className="border rounded-lg p-6 space-y-6">
                    <div className="space-y-1.5">
                        <div className="h-5 w-64 rounded bg-muted" />
                        <div className="h-3.5 w-full max-w-md rounded bg-muted" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="h-4 w-16 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-36 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-28 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 border-t border-border justify-end pt-6 mt-4">
                    <div className="h-10 w-full sm:w-32 rounded bg-muted" />
                    <div className="h-10 w-full sm:w-48 rounded bg-muted" />
                </div>
            </div>
        </div>
    );
}