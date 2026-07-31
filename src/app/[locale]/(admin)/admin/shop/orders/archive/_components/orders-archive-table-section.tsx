import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { archiveColumns } from "./archive-columns";

export default async function OrdersArchiveTableSection() {
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
        <DataTable
            columns={archiveColumns}
            data={orders}
            searchPlaceholder="Пошук за клієнтом..."
        />
    );
}