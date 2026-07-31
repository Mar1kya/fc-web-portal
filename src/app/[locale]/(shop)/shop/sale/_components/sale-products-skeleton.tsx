export default function SaleProductsSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

function ProductCardSkeleton() {
    return (
        <div className="h-full w-full flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm">
            <div className="relative aspect-4/5 w-full bg-muted/40 border-b border-border/50">
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
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