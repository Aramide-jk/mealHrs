import type { Cart } from "@mealhrs/domain";

export const SERVICE_FEE_NGN = 250;

export function cartSubtotal(cart: Cart): number {
  return cart.items.reduce((total, item) => {
    const options = item.selectedOptions.reduce((sum, option) => sum + option.priceDelta.amount, 0);
    return total + (item.unitPrice.amount + options) * item.quantity;
  }, 0);
}

export function cartTotal(cart: Cart, deliveryFee: number): number {
  return cartSubtotal(cart) + deliveryFee + SERVICE_FEE_NGN;
}
