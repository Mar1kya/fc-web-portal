"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { processCheckout } from "@/actions/checkout"
import { useCartStore } from "@/store/useCartStore"
import { useStore } from "@/hooks/useStore"
import { Store, Box, Truck, CreditCard, Banknote } from "lucide-react"
import CheckoutSummary from "./checkout-summary"

type CheckoutFormProps = {
    initialData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        city: string;
        postalCode: string;
        address: string;
    } | null;
    className?: string;
};

const StepTitle = ({ number, title }: { number: number; title: string }) => (
    <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold shrink-0">
            {number}
        </div>
        <span className="text-xl uppercase font-black tracking-tight">{title}</span>
    </div>
);

export default function CheckoutForm({ initialData, className, ...props }: CheckoutFormProps) {
    const t = useTranslations("Shop.CheckoutPage");
    const cartItems = useStore(useCartStore, (state) => state.items) || [];
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const [deliveryMethod, setDeliveryMethod] = useState<"branch" | "postomat" | "courier">("branch");
    const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
    const processCheckoutWithData = processCheckout.bind(null, cartItems, deliveryMethod, paymentMethod);
    const [state, actionFn, isPending] = useActionState(processCheckoutWithData, undefined);

    useEffect(() => {
        if (state?.outOfStockItem) {
            const { variantId, availableStock } = state.outOfStockItem;

            const currentStore = useCartStore.getState();
            const cartItemToUpdate = currentStore.items.find((item) => item.variantId === variantId);

            if (cartItemToUpdate) {
                setTimeout(() => {
                    if (availableStock === 0) {
                        currentStore.removeItem(cartItemToUpdate.cartItemId);
                        toast.error(state.message);
                    } else {
                        currentStore.updateQuantity(cartItemToUpdate.cartItemId, availableStock);
                        toast.error(t("partialStockError", { count: availableStock }));
                    }
                }, 0);
            }
        }
        else if (state?.message) {
            toast.error(state.message);
        }
    }, [state, t]);

    return (
        <div className={cn("w-full", className)} {...props}>
            <form action={actionFn} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <StepTitle number={1} title={t("step1")} />
                        </CardHeader>
                        <CardContent className="pt-6">
                            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                <Field>
                                    <FieldLabel htmlFor="firstName">{t("Form.firstName")}</FieldLabel>
                                    <Input id="firstName" name="firstName" defaultValue={initialData?.firstName} className="focus-visible:ring-emerald-600" />
                                    {state?.errors?.firstName && <p className="text-destructive text-xs mt-1 font-medium">{state.errors.firstName[0]}</p>}
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="lastName">{t("Form.lastName")}</FieldLabel>
                                    <Input id="lastName" name="lastName" defaultValue={initialData?.lastName} className="focus-visible:ring-emerald-600" />
                                    {state?.errors?.lastName && <p className="text-destructive text-xs mt-1 font-medium">{state.errors.lastName[0]}</p>}
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="email">{t("Form.email")}</FieldLabel>
                                    <Input id="email" type="email" name="email" defaultValue={initialData?.email} className="focus-visible:ring-emerald-600" />
                                    {state?.errors?.email && <p className="text-destructive text-xs mt-1 font-medium">{state.errors.email[0]}</p>}
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="phone">{t("Form.phone")}</FieldLabel>
                                    <Input id="phone" type="tel" name="phone" defaultValue={initialData?.phone} className="focus-visible:ring-emerald-600" />
                                    {state?.errors?.phone && <p className="text-destructive text-xs mt-1 font-medium">{state.errors.phone[0]}</p>}
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <StepTitle number={2} title={t("step2")} />
                        </CardHeader>
                        <CardContent className="pt-6">
                            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="sm:col-span-2">
                                    <FieldLabel className="mb-3 block text-sm font-bold uppercase">{t("Form.deliveryType")}</FieldLabel>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Button
                                            type="button"
                                            variant={deliveryMethod === "branch" ? "default" : "outline"}
                                            className={cn("h-12 border-border/50 transition-all", deliveryMethod === "branch" && "ring-1 ring-emerald-600 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20")}
                                            onClick={() => setDeliveryMethod("branch")}
                                        >
                                            <Store className="w-4 h-4 mr-2" />
                                            {t("Form.deliveryBranch")}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={deliveryMethod === "postomat" ? "default" : "outline"}
                                            className={cn("h-12 border-border/50 transition-all", deliveryMethod === "postomat" && "ring-1 ring-emerald-600 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20")}
                                            onClick={() => setDeliveryMethod("postomat")}
                                        >
                                            <Box className="w-4 h-4 mr-2" />
                                            {t("Form.deliveryPostomat")}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={deliveryMethod === "courier" ? "default" : "outline"}
                                            className={cn("h-12 border-border/50 transition-all", deliveryMethod === "courier" && "ring-1 ring-emerald-600 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20")}
                                            onClick={() => setDeliveryMethod("courier")}
                                        >
                                            <Truck className="w-4 h-4 mr-2" />
                                            {t("Form.deliveryCourier")}
                                        </Button>
                                    </div>
                                </div>
                                <Field className={cn(deliveryMethod === "courier" ? "sm:col-span-2" : "")}>
                                    <FieldLabel htmlFor="city">{t("Form.city")}</FieldLabel>
                                    <Input id="city" name="city" defaultValue={initialData?.city} className="focus-visible:ring-emerald-600" />
                                    {state?.errors?.city && <p className="text-destructive text-xs mt-1 font-medium">{state.errors.city[0]}</p>}
                                </Field>
                                {deliveryMethod !== "courier" && (
                                    <Field>
                                        <FieldLabel htmlFor="postalCode">
                                            {deliveryMethod === "branch" ? t("Form.branchNumber") : t("Form.postomatNumber")}
                                        </FieldLabel>
                                        <Input id="postalCode" name="postalCode" defaultValue={initialData?.postalCode} className="focus-visible:ring-emerald-600" />
                                        {state?.errors?.postalCode && <p className="text-destructive text-xs mt-1 font-medium">{state.errors.postalCode[0]}</p>}
                                    </Field>
                                )}
                                {deliveryMethod === "courier" && (
                                    <Field className="sm:col-span-2">
                                        <FieldLabel htmlFor="address">{t("Form.address")}</FieldLabel>
                                        <Input id="address" name="address" defaultValue={initialData?.address} className="focus-visible:ring-emerald-600" />
                                        {state?.errors?.address && <p className="text-destructive text-xs mt-1 font-medium">{state.errors.address[0]}</p>}
                                    </Field>
                                )}
                            </FieldGroup>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <StepTitle number={3} title={t("step3")} />
                        </CardHeader>
                        <CardContent className="pt-6">
                            <FieldLabel className="mb-3 block text-sm font-bold uppercase">{t("Form.paymentType")}</FieldLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant={paymentMethod === "card" ? "default" : "outline"}
                                    className={cn("h-14 border-border/50 transition-all justify-start px-4", paymentMethod === "card" && "ring-1 ring-emerald-600 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20")}
                                    onClick={() => setPaymentMethod("card")}
                                >
                                    <CreditCard className="w-5 h-5 mr-3 shrink-0" />
                                    <span className="truncate">{t("Form.payOnline")}</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant={paymentMethod === "cod" ? "default" : "outline"}
                                    className={cn("h-14 border-border/50 transition-all justify-start px-4", paymentMethod === "cod" && "ring-1 ring-emerald-600 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20")}
                                    onClick={() => setPaymentMethod("cod")}
                                >
                                    <Banknote className="w-5 h-5 mr-3 shrink-0" />
                                    <span className="truncate">{t("Form.payOnDelivery")}</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <CheckoutSummary cartItems={cartItems} totalPrice={totalPrice} isPending={isPending} />
            </form>
        </div>
    )
}