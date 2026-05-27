"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect as nativeRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";

export async function retryPayment(orderId: string) {
  try {
    const session = await auth();
    const locale = await getLocale();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: { include: { translations: true } } },
        },
      },
    });

    if (!order) return { error: "notFound" };

    if (order.userId && order.userId !== session?.user?.id) {
      return { error: "unauthorized" };
    }

    if (order.isPaid) return { error: "alreadyPaid" };
    if (order.status === "CANCELLED") return { error: "cancelled" };

    const line_items = order.orderItems.map((item) => {
      const translatedData = getTranslation(
        { translations: item.product.translations },
        locale,
      );
      const itemName = translatedData?.name || "Emerald Gang Product";
      const descriptionParts = [];
      if (item.size) descriptionParts.push(`Size: ${item.size}`);
      if (item.customName) descriptionParts.push(`Name: ${item.customName}`);
      if (item.customNumber)
        descriptionParts.push(`Number: ${item.customNumber}`);

      const description =
        descriptionParts.length > 0 ? descriptionParts.join(" • ") : undefined;

      return {
        price_data: {
          currency: "uah",
          product_data: {
            name: itemName,
            description: description,
          },
          unit_amount: Math.round(Number(item.fixedPrice) * 100),
        },
        quantity: item.quantity,
      };
    });

    const appUrl = process.env.AUTH_URL || "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      billing_address_collection: "auto",
      line_items,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${appUrl}/${locale}/shop/order/${order.id}`,
      cancel_url: `${appUrl}/${locale}/shop/order/${order.id}`,
      metadata: {
        orderId: order.id,
      },
    });

    if (!stripeSession.url) {
      return { error: "stripeError" };
    }

    nativeRedirect(stripeSession.url);
  } catch (error: unknown) {
    const isRedirectError =
      error instanceof Error &&
      (error.message === "NEXT_REDIRECT" ||
        ("digest" in error &&
          typeof error.digest === "string" &&
          error.digest.startsWith("NEXT_REDIRECT")));

    if (isRedirectError) {
      throw error;
    }

    console.error("Retry payment error:", error);
    return { error: "serverError" };
  }
}
