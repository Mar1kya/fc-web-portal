import { MAX_QTY_PER_ITEM } from "@/lib/constants";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  cartItemId: string;
  slug: string;
  productId: string;
  variantId: string;
  translations: { language: string; name: string }[];
  price: number;
  image: string;
  size: string | null;
  quantity: number;
  stock: number;
  customName?: string;
  customNumber?: string;
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

const generateCartItemId = (
  item: Omit<CartItem, "cartItemId" | "quantity">,
) => {
  const baseId = item.variantId || item.productId;
  let customPart = "";
  if (item.customName) customPart += `-${item.customName}`;
  if (item.customNumber) customPart += `-${item.customNumber}`;

  return `${baseId}${customPart}`;
};

const getStockTakenByOthers = (
  items: CartItem[],
  target: { productId: string; variantId: string | null; cartItemId: string },
) =>
  items
    .filter((i) => {
      if (i.cartItemId === target.cartItemId) return false;
      if (target.variantId) return i.variantId === target.variantId;
      return i.variantId === null && i.productId === target.productId;
    })
    .reduce((sum, i) => sum + i.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const cartItemId = generateCartItemId(item);
          const existingItem = state.items.find(
            (i) => i.cartItemId === cartItemId,
          );

          const stockTakenByOthers = getStockTakenByOthers(state.items, {
            productId: item.productId,
            variantId: item.variantId,
            cartItemId,
          });

          const availablePhysicalStock = Math.max(
            0,
            item.stock - stockTakenByOthers,
          );

          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + quantity,
              availablePhysicalStock,
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

          const quantityToAdd = Math.min(
            quantity,
            availablePhysicalStock,
            MAX_QTY_PER_ITEM,
          );

          if (quantityToAdd <= 0) return { items: state.items, isOpen: true };

          return {
            items: [
              ...state.items,
              { ...item, cartItemId, quantity: quantityToAdd },
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
        set((state) => {
          const itemToUpdate = state.items.find(
            (i) => i.cartItemId === cartItemId,
          );
          if (!itemToUpdate) return state;

          const stockTakenByOthers = getStockTakenByOthers(state.items, {
            productId: itemToUpdate.productId,
            variantId: itemToUpdate.variantId,
            cartItemId,
          });

          const availablePhysicalStock = Math.max(
            0,
            itemToUpdate.stock - stockTakenByOthers,
          );

          const validQuantity = Math.max(
            1,
            Math.min(quantity, availablePhysicalStock, MAX_QTY_PER_ITEM),
          );

          return {
            items: state.items.map((i) =>
              i.cartItemId === cartItemId
                ? { ...i, quantity: validQuantity }
                : i,
            ),
          };
        });
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
      version: 1,
      migrate: (persisted) => persisted as CartState,
    },
  ),
);

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "emerald-gang-cart") {
      useCartStore.persist.rehydrate();
    }
  });
}

export const useCartTotalItems = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

export const useCartTotalPriceStale = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.price * item.quantity, 0),
  );
