import { Separator } from "@/components/ui/separator";

export default function ProfileFormSkeleton() {
    return (
        <div className="w-full animate-pulse">
            <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-16 items-start">
                <div className="flex-1 w-full space-y-8">
                    <div className="space-y-6">
                        <FieldSkeleton />
                        <FieldSkeleton />
                    </div>
                    <Separator />
                    <div className="space-y-6">
                        <FieldSkeleton />
                        <FieldSkeleton />
                        <FieldSkeleton />
                    </div>
                    <div className="h-10 w-40 rounded-md bg-muted" />
                </div>
                <div className="flex flex-col items-center justify-start shrink-0 w-full lg:w-64 xl:w-72 lg:border-l border-border lg:pl-10 xl:pl-12 pt-2 pb-8 lg:pb-0">
                    <div className="w-40 h-40 xl:w-48 xl:h-48 rounded-2xl bg-muted mb-4 border border-border/50" />
                    <div className="h-4 w-28 rounded bg-muted" />
                </div>
            </div>
        </div>
    );
}

function FieldSkeleton() {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 sm:mt-2 w-full sm:max-w-50">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-3 w-40 rounded bg-muted/60" />
            </div>
            <div className="w-full sm:max-w-xs flex flex-col gap-1.5">
                <div className="h-10 w-full rounded-md bg-muted" />
            </div>
        </div>
    );
}