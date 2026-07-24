export default function OrderListSkeleton() {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
        </div>
    );
}

function OrderCardSkeleton() {
    return (
        <div className="flex flex-col border border-border/50 bg-muted/10 rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-border/50 bg-muted/30">
                <div>
                    <div className="h-6 w-24 rounded bg-muted mb-1" />
                    <div className="h-3 w-32 rounded bg-muted/60 mt-0.5" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-background/50 p-2.5 sm:px-3 rounded-lg border border-border/50 w-full md:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                        <div className="h-3 w-16 rounded bg-muted/60" />
                        <div className="h-6 w-20 rounded-md bg-muted" />
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-border" />
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                        <div className="h-3 w-24 rounded bg-muted/60" />
                        <div className="h-6 w-20 rounded-md bg-muted" />
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        <div className="relative w-12 h-12 rounded-md border-2 border-background bg-muted" />
                    </div>
                    <div className="h-4 w-24 rounded bg-muted ml-2" />
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="flex flex-col sm:items-end gap-1">
                        <div className="h-3 w-12 rounded bg-muted/60 mb-0.5" />
                        <div className="h-6 w-20 rounded bg-muted" />
                    </div>
                    <div className="h-10 w-24 rounded-md bg-muted" />
                </div>
            </div>
        </div>
    );
}