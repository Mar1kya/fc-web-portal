import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const timeLimitMs = 30 * 60 * 1000;
    const cutoff = new Date(Date.now() - timeLimitMs);

    const result = await prisma.order.updateMany({
        where: {
            isPaid: false,
            paymentMethod: "CARD",
            status: { notIn: ["CANCELLED"] },
            createdAt: { lt: cutoff },
        },
        data: { status: "CANCELLED" },
    });

    return NextResponse.json({ cancelledCount: result.count });
}