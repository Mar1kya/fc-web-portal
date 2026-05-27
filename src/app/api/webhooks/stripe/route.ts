import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

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

    if (orderId) {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            isPaid: true,
          },
        });
      } catch {
        return new NextResponse("Database Error", { status: 500 });
      }
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await prisma.$transaction(async (tx) => {
          const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true },
          });

          if (!order || order.status === "CANCELLED" || order.isPaid) {
            return;
          }

          await tx.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
          });

          for (const item of order.orderItems) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: {
                  stock: {
                    increment: item.quantity,
                  },
                },
              });
            }
          }
        });
      } catch {
        return new NextResponse("Database Error", { status: 500 });
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
