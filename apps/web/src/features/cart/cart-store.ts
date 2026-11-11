"use client";

import type { Cart, CartItem } from "@mealhrs/domain";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PaymentPreview = Readonly<{
  cart: Cart;
  deliveryFee: number;
  fulfillment: "delivery" | "pickup";
  serviceFee: number;
  subtotal: number;
  total: number;
  vendorName: string;
}>;

type CartState = {
  cart: Cart | null;
  paymentPreview: PaymentPreview | null;
  hydrateSeed: (cart: Cart | null) => void;
  addItem: (cart: Pick<Cart, "vendorId" | "orderingMode">, item: CartItem) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  setPaymentPreview: (preview: PaymentPreview) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(persist((set) => ({
  cart: null,
  paymentPreview: null,
  hydrateSeed: (seed) => set((state) => state.cart ? state : { cart: seed }),
  addItem: (identity, item) => set((state) => {
    const compatible = state.cart?.vendorId === identity.vendorId && state.cart.orderingMode === identity.orderingMode;
    const items = compatible ? [...state.cart!.items] : [];
    const index = items.findIndex((candidate) => candidate.id === item.id);
    if (index >= 0) items[index] = { ...items[index]!, quantity: items[index]!.quantity + item.quantity };
    else items.push(item);
    return { cart: { ...identity, items } };
  }),
  setQuantity: (itemId, quantity) => set((state) => state.cart ? ({ cart: { ...state.cart, items: state.cart.items.map((item) => item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item) } }) : state),
  removeItem: (itemId) => set((state) => state.cart ? ({ cart: { ...state.cart, items: state.cart.items.filter((item) => item.id !== itemId) } }) : state),
  setPaymentPreview: (paymentPreview) => set({ paymentPreview }),
  clear: () => set({ cart: null, paymentPreview: null }),
}), { name: "mealhrs-cart", partialize: (state) => ({ cart: state.cart, paymentPreview: state.paymentPreview }) }));

/** Client integration point for dish/Reel add actions. Replaces an incompatible cart atomically. */
export const addCartItem = (identity: Pick<Cart, "vendorId" | "orderingMode">, item: CartItem) => useCartStore.getState().addItem(identity, item);
