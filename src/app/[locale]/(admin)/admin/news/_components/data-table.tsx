"use client"

import { useState } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    ColumnFiltersState,
    useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { postTypeTranslations, teamContextTranslations } from "./columns"
import { ChevronLeft, ChevronRight } from "lucide-react"

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState<string>("")

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        initialState: {
            pagination: { pageSize: 10 },
        },
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <Input
                    placeholder="Пошук новин..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="w-full md:w-64 lg:max-w-sm"
                />
                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 w-full md:w-auto">
                    <Select
                        value={(table.getColumn("teamContext")?.getFilterValue() as string) ?? "ALL"}
                        onValueChange={(value) => table.getColumn("teamContext")?.setFilterValue(value)}
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Команда" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Всі команди</SelectItem>
                            {Object.entries(teamContextTranslations).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={(table.getColumn("type")?.getFilterValue() as string) ?? "ALL"}
                        onValueChange={(value) => table.getColumn("type")?.setFilterValue(value)}
                    >
                        <SelectTrigger className="w-full sm:w-35">
                            <SelectValue placeholder="Категорія" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Всі категорії</SelectItem>
                            {Object.entries(postTypeTranslations).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={(table.getColumn("isPublished")?.getFilterValue() as string) ?? "ALL"}
                        onValueChange={(value) => table.getColumn("isPublished")?.setFilterValue(value)}
                    >
                        <SelectTrigger className="w-full sm:w-35">
                            <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Всі статуси</SelectItem>
                            <SelectItem value="PUBLISHED">Опубліковано</SelectItem>
                            <SelectItem value="SCHEDULED">Заплановано</SelectItem>
                            <SelectItem value="DRAFT">Чернетка</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="rounded-md border bg-card overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <Table className="min-w-225">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Не знайдено жодної публікації за цими критеріями.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Показано {table.getRowModel().rows.length} з {table.getPrePaginationRowModel().rows.length} записів
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Попередня сторінка</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Наступна сторінка</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}