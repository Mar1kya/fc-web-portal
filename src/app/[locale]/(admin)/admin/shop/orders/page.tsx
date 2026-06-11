import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/columns";

export const metadata = {
    title: "Замовлення",
    description: "Управління замовленнями інтернет-магазину",
};

export default async function OrdersPage() {
    const rawOrders = await prisma.order.findMany({
        where: { deletedAt: null },
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
        orderBy: { createdAt: "desc" },
    });

    const orders = rawOrders.map((order) => ({
        ...order,
        totalPrice: Number(order.totalPrice),
        orderItems: order.orderItems.map((item) => ({
            ...item,
            fixedPrice: Number(item.fixedPrice),
        })),
    }));

    const filterConfigs = [
        {
            columnId: "status",
            placeholder: "Статус замовлення",
            options: [
                { label: "Очікує", value: "PENDING" },
                { label: "Відправлено", value: "SHIPPED" },
                { label: "Доставлено", value: "DELIVERED" },
                { label: "Скасовано", value: "CANCELLED" },
            ],
        },
        {
            columnId: "isPaid",
            placeholder: "Стан оплати",
            options: [
                { label: "Оплачено", value: "PAID" },
                { label: "Не оплачено", value: "UNPAID" },
            ],
        },
        {
            columnId: "paymentMethod",
            placeholder: "Спосіб оплати",
            options: [
                { label: "Картою", value: "CARD" },
                { label: "Накладений платіж", value: "COD" },
            ],
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Замовлення</h2>
                    <p className="text-muted-foreground mt-1">
                        Відстежуйте статуси та деталі замовлень клієнтів.
                    </p>
                </div>
                <Button variant="outline" asChild className="gap-2 w-full sm:w-auto">
                    <Link href="/admin/shop/orders/archive">
                        <Archive className="w-4 h-4" />
                        Архів
                    </Link>
                </Button>
            </div>
            <div className="mt-2">
                <DataTable
                    columns={columns}
                    data={orders}
                    searchPlaceholder="Пошук за клієнтом або товаром..."
                    filters={filterConfigs}
                />
            </div>
        </div>
    );
}