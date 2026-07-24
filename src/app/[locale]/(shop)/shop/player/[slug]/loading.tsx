export default function Loading() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start animate-pulse">
            <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="relative w-full aspect-4/5 bg-muted rounded-2xl border border-border/50" />
                    <div className="relative w-full aspect-4/5 bg-muted rounded-2xl border border-border/50" />
                </div>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="flex flex-col gap-4 border-b border-border pb-6">
                    <div className="h-9 w-3/4 rounded bg-muted" />
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-20 rounded-full bg-muted" />
                        <div className="h-4 w-24 rounded bg-muted" />
                    </div>
                    <div className="h-8 w-32 rounded bg-muted mt-2" />
                </div>
                <div className="flex flex-col gap-3">
                    <div className="h-4 w-28 rounded bg-muted" />
                    <div className="flex flex-wrap gap-2">
                        <div className="h-10 w-24 rounded-md bg-muted" />
                        <div className="h-10 w-24 rounded-md bg-muted" />
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="h-4 w-16 rounded bg-muted" />
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-10 w-14 rounded-md bg-muted" />
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between py-4 border-y border-border">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-10 w-24 rounded-md bg-muted" />
                </div>
                <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="h-8 w-28 rounded bg-muted" />
                    <div className="h-12 flex-1 rounded-md bg-muted" />
                </div>
            </div>
        </div>
    );
}