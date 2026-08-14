import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { cancelExpiredOrders } from "@/lib/utils/expire-order";

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

export default async function OrdersTableSection() {
    await cancelExpiredOrders();

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
        take: 500,
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
        <DataTable
            columns={columns}
            data={orders}
            searchPlaceholder="Пошук за клієнтом або товаром..."
            filters={filterConfigs}
        />
    );
}