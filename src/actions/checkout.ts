"use server"

import { auth } from "@/auth"; 
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createCheckoutSchema } from "@/lib/schemas";
import { CartItem } from "@/store/useCartStore";

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
                select: { firstName: true, lastName: true, phone: true, email: true, city: true, postalCode: true, address: true }
            }
        }
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
};

export async function processCheckout(
    cartItems: CartItem[],
    deliveryMethod: "branch" | "postomat" | "courier",
    paymentMethod: "card" | "cod",
    _prevState: CheckoutState | undefined,
    formData: FormData
): Promise<CheckoutState | undefined> {
    const tErrors = await getTranslations("Shop.CheckoutErrors");
    const tForm = await getTranslations("Shop.CheckoutPage.Form"); 
    const locale = await getLocale();

    const CheckoutSchema = createCheckoutSchema(tErrors);
    const validatedFields = CheckoutSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: tErrors("invalidData")
        };
    }

    const { firstName, lastName, email, phone, city, postalCode, address } = validatedFields.data;

    if (deliveryMethod === "courier" && (!address || address.length < 2)) {
        return { errors: { address: [tErrors("tooShort")] }, message: tErrors("invalidData") };
    }
    if (deliveryMethod !== "courier" && (!postalCode || postalCode.length < 1)) {
        return { errors: { postalCode: [tErrors("tooShort")] }, message: tErrors("invalidData") };
    }

    const session = await auth();

    const methodTranslate = 
        deliveryMethod === "branch" ? tForm("deliveryBranch") : 
        deliveryMethod === "postomat" ? tForm("deliveryPostomat") : 
        tForm("deliveryCourier");

    const finalAddress = deliveryMethod === "courier" 
        ? `[${methodTranslate}] ${address}` 
        : `[${methodTranslate}] №${postalCode}`;

    try {
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return { message: tErrors("emptyCart") };
        }

        const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const order = await prisma.order.create({
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
                    create: cartItems.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        size: item.size,
                        quantity: item.quantity,
                        fixedPrice: item.price, 
                        customName: item.customName || null,
                        customNumber: item.customNumber || null,
                    }))
                }
            }
        });

        console.log("Order created successfully:", order.id);

        if (paymentMethod === "cod") {
            redirect({ href: `/shop/order/${order.id}`, locale: locale });
        } else {
            redirect({ href: `/shop/order/${order.id}`, locale: locale });
        }

    } catch (error) {
        console.error("Checkout error:", error);
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error; 
        }
        return { message: tErrors("serverError") };
    }
}