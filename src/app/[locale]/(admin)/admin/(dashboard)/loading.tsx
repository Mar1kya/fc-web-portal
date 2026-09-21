import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AdminDashboardLoading() {
    return (
        <div className="flex flex-col gap-8 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4">
                <Skeleton className="h-9 w-40" />
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-9 w-36" />
                    <Skeleton className="h-9 w-9" />
                </div>
            </div>
            <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-7 w-20 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                    <Skeleton className="h-9 w-28" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-9 w-24 rounded-md" />
                        ))}
                    </div>
                    <Skeleton className="h-72 w-full rounded-lg" />
                </CardContent>
            </Card>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <div>
                                <Skeleton className="h-5 w-44 mb-1" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between gap-4">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-6 w-20 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <div>
                                    <Skeleton className="h-5 w-36 mb-1" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-8 rounded-full" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-32 mb-1" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <Skeleton className="h-4 w-10" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <div>
                                    <Skeleton className="h-5 w-48 mb-1" />
                                    <Skeleton className="h-3 w-44" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-36 mb-1" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                    <Skeleton className="h-8 w-24 rounded-md" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}