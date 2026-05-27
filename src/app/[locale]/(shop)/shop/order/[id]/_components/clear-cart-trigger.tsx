"use client"

import { useEffect } from "react"
import { useCartStore } from "@/store/useCartStore"

export default function ClearCartTrigger() {
    useEffect(() => {
        const clearCart = useCartStore.getState().clearCart;
        if (typeof clearCart === "function") {
            clearCart();
        }
    }, []);

    return null;
}