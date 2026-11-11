import type { AddressId, DishId, OfferId, OrderId, VendorId } from "./ids";
import type { Money } from "./money";

export type CartItem = Readonly<{
  id: string;
  dishId: DishId;
  offerId: OfferId;
  name: string;
  imageUrl: string;
  unitPrice: Money;
  quantity: number;
  selectedOptions: readonly Readonly<{ name: string; value: string; priceDelta: Money }>[];
  instructions?: string;
}>;

export type Cart = Readonly<{
  vendorId: VendorId;
  orderingMode: "immediate" | "meal_drop";
  items: readonly CartItem[];
}>;

export type PaymentStatus = "pending" | "paid" | "failed" | "refund_pending" | "refunded";
export type OrderStatus = "pending_vendor" | "confirmed" | "preparing" | "ready" | "cancelled" | "timed_out";
export type FulfillmentStatus = "scheduled" | "preparing" | "ready_for_dispatch" | "out_for_delivery" | "delivered" | "delivery_failed";

export type Order = Readonly<{
  id: OrderId;
  reference: string;
  vendorId: VendorId;
  vendorName: string;
  orderingMode: "immediate" | "meal_drop";
  fulfillmentMode: "delivery" | "pickup";
  items: readonly CartItem[];
  addressId?: AddressId;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  fulfillmentWindow: string;
  subtotal: Money;
  deliveryFee: Money;
  serviceFee: Money;
  total: Money;
  createdAt: string;
  events: readonly Readonly<{ label: string; occurredAt: string; detail: string }>[];
}>;
