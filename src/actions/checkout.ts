"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { redirect as nativeRedirect } from "next/navigation";
import { createCheckoutSchema } from "@/lib/schemas";
import { CartItem } from "@/store/useCartStore";
import { stripe } from "@/lib/stripe";
import { getTranslation } from "@/lib/utils/get-translation";

export async function getCheckoutInitialData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id, deletedAt: null },
    select: {
      name: true,
      email: true,
      orders: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          city: true,
          postalCode: true,
          address: true,
        },
      },
    },
  });

  if (!userData) return null;
  const lastOrder = userData.orders[0] || null;
  const nameParts = userData.name?.trim().split(" ") || [];

  return {
    firstName: lastOrder?.firstName || nameParts[0] || "",
    lastName: lastOrder?.lastName || nameParts.slice(1).join(" ") || "",
    email: lastOrder?.email || userData.email || "",
    phone: lastOrder?.phone || "",
    city: lastOrder?.city || "",
    postalCode: lastOrder?.postalCode || "",
    address: lastOrder?.address || "",
  };
}

export type CheckoutState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    phone?: string[];
    city?: string[];
    postalCode?: string[];
    address?: string[];
  };
  message?: string;
  outOfStockItem?: {
    variantId: string;
    availableStock: number;
  };
};

export async function processCheckout(
  cartItems: CartItem[],
  deliveryMethod: "branch" | "postomat" | "courier",
  paymentMethod: "card" | "cod",
  _prevState: CheckoutState | undefined,
  formData: FormData,
): Promise<CheckoutState | undefined> {
  const tErrors = await getTranslations("Shop.CheckoutErrors");
  const tForm = await getTranslations("Shop.CheckoutPage.Form");
  const tSummary = await getTranslations("Shop.CheckoutPage.Summary");
  const locale = await getLocale();

  const CheckoutSchema = createCheckoutSchema(tErrors);
  const validatedFields = CheckoutSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: tErrors("invalidData"),
    };
  }

  const { firstName, lastName, email, phone, city, postalCode, address } =
    validatedFields.data;

  if (deliveryMethod === "courier" && (!address || address.length < 2)) {
    return {
      errors: { address: [tErrors("tooShort")] },
      message: tErrors("invalidData"),
    };
  }
  if (deliveryMethod !== "courier" && (!postalCode || postalCode.length < 1)) {
    return {
      errors: { postalCode: [tErrors("tooShort")] },
      message: tErrors("invalidData"),
    };
  }

  const session = await auth();

  const methodTranslate =
    deliveryMethod === "branch"
      ? tForm("deliveryBranch")
      : deliveryMethod === "postomat"
        ? tForm("deliveryPostomat")
        : tForm("deliveryCourier");

  const finalAddress =
    deliveryMethod === "courier"
      ? `[${methodTranslate}] ${address}`
      : `[${methodTranslate}] №${postalCode}`;

  try {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { message: tErrors("emptyCart") };
    }

    const totalPrice = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        if (!item.variantId) {
          throw new Error(`MissingVariantId:${item.productId}`);
        }

        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant) {
          throw new Error(`VariantNotFound:${item.variantId}`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(`OutOfStock:${item.variantId}:${variant.stock}`);
        }

        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: variant.stock - item.quantity,
          },
        });
      }

      return await tx.order.create({
        data: {
          userId: session?.user?.id || null,
          status: "PENDING",
          isPaid: false,
          paymentMethod: paymentMethod === "card" ? "CARD" : "COD",
          totalPrice,
          firstName,
          lastName,
          email,
          phone,
          city,
          postalCode: postalCode || "",
          address: finalAddress,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              size: item.size,
              quantity: item.quantity,
              fixedPrice: item.price,
              customName: item.customName || null,
              customNumber: item.customNumber || null,
            })),
          },
        },
      });
    });

    console.log("Order created successfully:", order.id);

    const appUrl = process.env.AUTH_URL || "http://localhost:3000";

    if (paymentMethod === "cod") {
      redirect({ href: `/shop/order/${order.id}`, locale: locale });
    } else {
      const line_items = cartItems.map((item) => {
        const translatedData = getTranslation(
          { translations: item.translations },
          locale,
        );
        const itemName = translatedData?.name || "Emerald Gang Produc";

        const descriptionParts = [];
        if (item.size) descriptionParts.push(`${tSummary("size")}: ${item.size}`);
        if (item.customName) descriptionParts.push(`Name: ${item.customName}`);
        if (item.customNumber) descriptionParts.push(`Number: ${item.customNumber}`);
        
        const description = descriptionParts.length > 0 ? descriptionParts.join(" • ") : undefined;

        return {
          price_data: {
            currency: "uah",
            product_data: {
              name: itemName,
              description: description,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
      });

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        billing_address_collection: "auto",
        line_items,
        success_url: `${appUrl}/${locale}/shop/order/${order.id}`,
        cancel_url: `${appUrl}/${locale}/shop/order/${order.id}`,
        metadata: {
          orderId: order.id,
        },
      });

      if (!stripeSession.url) {
        throw new Error("Stripe session URL generation failed");
      }

      nativeRedirect(stripeSession.url);
    }
  } catch (error: unknown) {
    const isRedirectError = 
      error instanceof Error && 
      (error.message === "NEXT_REDIRECT" || 
      ("digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")));

    if (isRedirectError) {
      throw error;
    }
    
    if (error instanceof Error && error.message.startsWith("OutOfStock")) {
      const [, variantId, stockStr] = error.message.split(":");
      const availableStock = parseInt(stockStr, 10);

      return { 
        message: tErrors("outOfStock"),
        outOfStockItem: {
            variantId,
            availableStock
        }
      };
    }

    console.error("Checkout error:", error);
    return { message: tErrors("serverError") };
  }
}