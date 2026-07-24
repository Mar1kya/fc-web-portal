export default function ProductCarouselSkeleton({ title }: { title: string }) {
    return (
        <section className="w-full">
            <div className="flex items-end justify-between border-b border-border pb-4 mb-6">
                <h2 className="text-2xl font-bold uppercase tracking-tight">
                    {title}
                </h2>
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                </div>
            </div>
            <div className="overflow-hidden">
                <div className="flex -ml-4 sm:-ml-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div 
                            key={i} 
                            className="pl-4 sm:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4 flex shrink-0 w-full"
                        >
                            <div className="w-full">
                                <ProductCardSkeleton />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCardSkeleton() {
    return (
        <div className="h-full w-full flex flex-col overflow-hidden rounded-2xl bg-card border border-border animate-pulse shadow-sm">
            <div className="relative aspect-4/5 w-full bg-muted/40 border-b border-border/50">
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    <div className="h-5 w-12 rounded-md bg-muted-foreground/20" />
                </div>
            </div>
            <div className="flex flex-col gap-3 p-4 grow">
                <div className="flex flex-col gap-1">
                    <div className="h-2.5 w-16 bg-muted rounded mb-1" />
                    <div className="h-4 w-full bg-muted rounded mt-1" />
                    <div className="h-4 w-2/3 bg-muted rounded mt-1" />
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="h-6 w-20 bg-muted rounded" />
                    <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                </div>
            </div>
        </div>
    );
}