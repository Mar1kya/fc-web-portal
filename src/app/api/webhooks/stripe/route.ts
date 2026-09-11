import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { LOCALES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { Prisma } from "../../../../../generated/prisma";

function revalidateOrderPaths(orderId: string) {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/shop/order/${orderId}`);
    revalidatePath(`/${locale}/admin/shop/orders/${orderId}`);
    revalidatePath(`/${locale}/admin/shop/orders`);
    revalidatePath(`/${locale}/profile/history`);
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (orderId) {
      try {
        await prisma.$transaction(
          async (tx) => {
            const order = await tx.order.findUnique({
              where: { id: orderId },
              include: { orderItems: true },
            });
            if (!order) return;

            if (order.refundedAt) return;

            const wasCancelledBySystem = order.status === "CANCELLED";

            if (wasCancelledBySystem) {
              for (const item of order.orderItems) {
                if (item.variantId) {
                  await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } },
                  });
                }
              }
            }

            await tx.order.update({
              where: { id: orderId },
              data: {
                isPaid: true,
                status: wasCancelledBySystem ? "PENDING" : order.status,
                stripePaymentIntentId:
                  paymentIntentId ?? order.stripePaymentIntentId,
              },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
        revalidateOrderPaths(orderId);
      } catch {
        return new NextResponse("Database Error", { status: 500 });
      }
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await prisma.$transaction(
          async (tx) => {
            const order = await tx.order.findUnique({
              where: { id: orderId },
              include: { orderItems: true },
            });

            if (!order || order.status === "CANCELLED" || order.isPaid) {
              return;
            }

            await tx.order.update({
              where: { id: orderId },
              data: {
                status: "CANCELLED",
                stockRestored: true,
                cancelledBy: "SYSTEM",
                cancelledAt: new Date(),
              },
            });

            for (const item of order.orderItems) {
              if (item.variantId) {
                await tx.productVariant.update({
                  where: { id: item.variantId },
                  data: { stock: { increment: item.quantity } },
                });
              }
            }
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch {
        return new NextResponse("Database Error", { status: 500 });
      }
      revalidateOrderPaths(orderId);
    }
  }

  return new NextResponse(null, { status: 200 });
}
