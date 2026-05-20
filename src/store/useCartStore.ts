import { MAX_QTY_PER_ITEM } from "@/lib/constants";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  cartItemId: string;
  slug: string;
  productId: string;
  variantId: string | null;
  translations: { language: string; name: string }[];
  price: number;
  image: string;
  size: string | null;
  quantity: number;
  stock: number;
}
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    item: Omit<CartItem, "cartItemId" | "quantity">,
    quantity?: number,
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (isOpen?: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const cartItemId = item.variantId || item.productId;
          const existingItem = state.items.find(
            (i) => i.cartItemId === cartItemId,
          );

          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + quantity,
              item.stock,
              MAX_QTY_PER_ITEM,
            );
            return {
              items: state.items.map((i) =>
                i.cartItemId === cartItemId
                  ? { ...i, quantity: newQuantity }
                  : i,
              ),
              isOpen: true,
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                cartItemId,
                quantity: Math.min(quantity, item.stock, MAX_QTY_PER_ITEM),
              },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i.cartItemId === cartItemId) {
              const validQuantity = Math.max(
                1,
                Math.min(quantity, i.stock, MAX_QTY_PER_ITEM),
              );
              return { ...i, quantity: validQuantity };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: (isOpen) =>
        set((state) => ({
          isOpen: isOpen !== undefined ? isOpen : !state.isOpen,
        })),
    }),
    {
      name: "emerald-gang-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const useCartTotalItems = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

export const useCartTotalPrice = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.price * item.quantity, 0),
  );
