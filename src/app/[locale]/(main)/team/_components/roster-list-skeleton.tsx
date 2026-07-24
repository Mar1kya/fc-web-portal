export default function RosterListSkeleton() {
    return (
        <div className="flex flex-col gap-10">
            {Array.from({ length: 3 }).map((_, groupIndex) => (
                <div key={groupIndex}>
                    <div className="h-6 w-40 rounded bg-muted animate-pulse mb-6" />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, cardIndex) => (
                            <PlayerCardSkeleton key={cardIndex} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function PlayerCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-xl border bg-card animate-pulse">
            <div className="aspect-3/4 w-full bg-muted" />
            <div className="flex flex-col p-3 border-t bg-card gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-3.5 w-6 rounded bg-muted" />
                        <div className="h-2.5 w-14 rounded bg-muted" />
                    </div>
                    <div className="h-3.5 w-5 rounded-xs bg-muted" />
                </div>
                <div className="h-4 w-3/4 rounded bg-muted" />
            </div>
        </div>
    );
}