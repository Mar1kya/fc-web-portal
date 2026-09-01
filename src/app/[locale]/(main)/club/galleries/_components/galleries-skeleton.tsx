import { Skeleton } from "@/components/ui/skeleton";

export default function GalleriesSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-4/5 w-full rounded-2xl" />
            ))}
        </div>
    );
}