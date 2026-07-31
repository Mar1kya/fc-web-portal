import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminTableSkeletonProps {
    columns?: number;
    rows?: number;
}

export default function AdminTableSkeleton({ 
    columns = 6, 
    rows = 10 
}: AdminTableSkeletonProps) {
    return (
        <div className="rounded-md border border-border/50 bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                        {Array.from({ length: columns }).map((_, i) => (
                            <TableHead key={i} className="py-4">
                                <Skeleton className="h-4 w-24 bg-muted/60" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex} className="hover:bg-transparent border-border/50">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell key={colIndex} className="py-3">
                                    {colIndex === 0 ? (
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-10 w-16 rounded-md shrink-0 bg-muted/60" />
                                            <div className="space-y-2 w-full">
                                                <Skeleton className="h-4 w-full max-w-50 bg-muted/60" />
                                                <Skeleton className="h-3 w-3/4 max-w-37.5 bg-muted/40" />
                                            </div>
                                        </div>
                                    ) : colIndex === columns - 1 ? (
                                        <div className="flex justify-end">
                                            <Skeleton className="h-8 w-8 rounded-md bg-muted/60" />
                                        </div>
                                    ) : (
                                        <Skeleton className="h-5 w-full max-w-25 rounded-full bg-muted/50" />
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}