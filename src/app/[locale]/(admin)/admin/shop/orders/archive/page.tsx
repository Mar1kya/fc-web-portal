
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./_components/archive-columns";

export const metadata: Metadata = {
    title: "Архів замовлень",
    description: "Приховані замовлення інтернет-магазину.",
};

export default async function OrdersArchivePage() {
    const rawOrders = await prisma.order.findMany({
        where: { deletedAt: { not: null } },
        include: {
            orderItems: {
                include: {
                    product: {
                        select: {
                            translations: {
                                where: { language: "uk" },
                                select: { language: true, name: true },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { deletedAt: "desc" },
    });

    const orders = rawOrders.map((order) => ({
        ...order,
        totalPrice: Number(order.totalPrice),
        orderItems: order.orderItems.map((item) => ({
            ...item,
            fixedPrice: Number(item.fixedPrice),
        })),
    }));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Архів замовлень</h2>
                    <p className="text-muted-foreground mt-1">
                        Тут зберігаються приховані замовлення. Можна відновити або видалити назавжди.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/shop/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад до замовлень
                    </Link>
                </Button>
            </div>
            <div className="mt-4">
                <DataTable
                    columns={archiveColumns}
                    data={orders}
                    searchPlaceholder="Пошук за клієнтом..."
                />
            </div>
        </div>
    );
}