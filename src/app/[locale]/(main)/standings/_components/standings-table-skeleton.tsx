import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function StandingsTableSkeleton() {
    const rows = Array.from({ length: 16 }); 

    return (
        <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-x-auto animate-pulse">
            <Table className="min-w-150">
                <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/50">
                        <TableHead className="w-12">
                            <div className="h-4 w-4 bg-muted/80 rounded mx-auto" />
                        </TableHead>
                        <TableHead>
                            <div className="h-4 w-20 bg-muted/80 rounded" />
                        </TableHead>
                        <TableHead className="w-12">
                            <div className="h-4 w-6 bg-muted/80 rounded mx-auto" />
                        </TableHead>
                        <TableHead className="w-12">
                            <div className="h-4 w-6 bg-muted/80 rounded mx-auto" />
                        </TableHead>
                        <TableHead className="w-12">
                            <div className="h-4 w-6 bg-muted/80 rounded mx-auto" />
                        </TableHead>
                        <TableHead className="w-12">
                            <div className="h-4 w-6 bg-muted/80 rounded mx-auto" />
                        </TableHead>
                        <TableHead className="w-20">
                            <div className="h-4 w-10 bg-muted/80 rounded mx-auto" />
                        </TableHead>
                        <TableHead className="w-16">
                            <div className="h-4 w-8 bg-muted/80 rounded mx-auto" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((_, i) => (
                        <TableRow key={i} className="hover:bg-muted/50">
                            <TableCell className="text-center">
                                <div className="h-4 w-4 rounded bg-muted mx-auto" />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-muted mr-3 shrink-0" />
                                    <div className="h-4 w-32 sm:w-48 rounded bg-muted" />
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="h-4 w-4 rounded bg-muted mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="h-4 w-4 rounded bg-muted mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="h-4 w-4 rounded bg-muted mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="h-4 w-4 rounded bg-muted mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="h-4 w-8 rounded bg-muted mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="h-5 w-6 rounded bg-muted mx-auto" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}