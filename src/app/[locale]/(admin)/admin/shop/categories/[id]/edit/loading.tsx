export default function Loading() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 w-72 rounded bg-muted" />
                <div className="h-4 w-80 rounded bg-muted" />
            </div>
            <div className="mt-4 space-y-8">
                <div className="border rounded-lg bg-card p-4 sm:p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        <div className="h-9 rounded bg-muted" />
                        <div className="h-9 rounded bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-40 rounded bg-muted" />
                        <div className="h-11 w-full max-w-xl rounded bg-muted" />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6 mt-4">
                    <div className="h-10 w-full sm:w-32 rounded bg-muted" />
                    <div className="h-10 w-full sm:w-48 rounded bg-muted" />
                </div>
            </div>
        </div>
    );
}