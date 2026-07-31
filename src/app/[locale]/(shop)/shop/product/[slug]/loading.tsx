export default function Loading() {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start animate-pulse">
                <div className="lg:col-span-7">
                    <ProductGallerySkeleton />
                </div>
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="h-9 w-4/5 rounded bg-muted" />
                    <ProductFormSkeleton />
                    <div className="mt-8 pt-8 border-t border-border space-y-2">
                        <div className="h-5 w-32 rounded bg-muted mb-2" />
                        <div className="h-4 w-full rounded bg-muted" />
                        <div className="h-4 w-full rounded bg-muted" />
                        <div className="h-4 w-2/3 rounded bg-muted" />
                    </div>
                </div>
            </div>
            <section className="mt-12 pt-12 border-t border-border animate-pulse">
                <div className="flex items-end justify-between mb-8">
                    <div className="h-7 w-56 rounded bg-muted" />
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-muted" />
                        <div className="h-9 w-9 rounded-full bg-muted" />
                    </div>
                </div>
                <div className="flex gap-4 sm:gap-6 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="basis-1/2 md:basis-1/3 lg:basis-1/4 shrink-0">
                            <ProductCardSkeleton />
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

function ProductGallerySkeleton() {
    return (
        <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 items-center lg:items-start">
            <div className="flex lg:flex-col gap-3 lg:w-20 shrink-0">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-20 h-24 lg:w-full lg:h-28 rounded-lg bg-muted shrink-0" />
                ))}
            </div>
            <div className="flex-1 flex justify-center w-full max-w-120">
                <div className="relative w-full aspect-4/5 bg-muted rounded-2xl border border-border/50" />
            </div>
        </div>
    );
}

function ProductFormSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-20 rounded-full bg-muted" />
                    <div className="h-4 w-24 rounded bg-muted" />
                </div>
                <div className="h-8 w-32 rounded bg-muted" />
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
    );
}

function ProductCardSkeleton() {
    return (
        <div className="h-full w-full flex flex-col overflow-hidden rounded-2xl bg-card border border-border">
            <div className="relative aspect-4/5 w-full bg-muted/40 border-b border-border/50">
                <div className="absolute top-3 left-3">
                    <div className="h-5 w-12 rounded-md bg-muted-foreground/20" />
                </div>
            </div>
            <div className="flex flex-col gap-3 p-4 grow">
                <div className="flex flex-col gap-1">
                    <div className="h-2.5 w-16 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="h-6 w-20 bg-muted rounded" />
                    <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                </div>
            </div>
        </div>
    );
}