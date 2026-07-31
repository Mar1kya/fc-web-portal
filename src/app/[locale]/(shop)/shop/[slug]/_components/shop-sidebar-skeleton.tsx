export default function ShopSidebarSkeleton() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-3">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-4 w-full rounded bg-muted" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}