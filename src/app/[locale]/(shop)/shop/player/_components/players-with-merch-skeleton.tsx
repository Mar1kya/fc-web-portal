export default function PlayersWithMerchSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
                <PlayerMerchCardSkeleton key={i} />
            ))}
        </div>
    );
}

function PlayerMerchCardSkeleton() {
    return (
        <div className="relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50">
            <div className="relative aspect-3/4 w-full bg-muted/40" />
            <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2">
                <div className="h-3.5 w-8 rounded bg-muted-foreground/20" />
                <div className="h-5 w-24 rounded bg-muted-foreground/20" />
            </div>
        </div>
    );
}