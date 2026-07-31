export default function Loading() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 w-64 rounded bg-muted" />
                <div className="h-4 w-96 rounded bg-muted" />
            </div>
            <div className="mt-4">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    <div className="xl:col-span-1 space-y-6 flex flex-col h-full">
                        <div className="border rounded-lg p-6 space-y-4">
                            <div className="h-5 w-36 rounded bg-muted" />
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div className="h-9 rounded bg-muted" />
                                <div className="h-9 rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-16 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                        </div>
                        <div className="border rounded-lg p-6 space-y-4 flex-1">
                            <div className="h-5 w-20 rounded bg-muted" />
                            <div className="space-y-2">
                                <div className="h-4 w-52 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-32 rounded bg-muted" />
                                <div className="h-10 w-full rounded bg-muted" />
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-2 space-y-6 flex flex-col h-full">
                        <div className="border rounded-lg p-6 space-y-4 flex-1 flex flex-col">
                            <div className="space-y-1.5">
                                <div className="h-5 w-40 rounded bg-muted" />
                                <div className="h-3.5 w-80 rounded bg-muted" />
                            </div>
                            <div className="h-24 w-full rounded-lg border-2 border-dashed bg-muted/30" />
                            <div className="h-100 w-full rounded-lg bg-muted/40" />
                        </div>
                    </div>
                    <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6">
                        <div className="h-10 w-full sm:w-32 rounded bg-muted" />
                        <div className="h-10 w-full sm:w-48 rounded bg-muted" />
                    </div>
                </div>
            </div>
        </div>
    );
}