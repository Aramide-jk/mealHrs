import type { AddressId, CartItem, Order, OrderId, VendorId } from "@mealhrs/domain";

export type CheckoutInput = Readonly<{
  vendorId: VendorId;
  vendorName?: string;
  fulfillmentMode: "delivery" | "pickup";
  items: readonly CartItem[];
  addressId?: AddressId;
  deliveryAddress?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalNgn: number;
  subtotalNgn?: number;
  deliveryFeeNgn?: number;
  packagingFeeNgn?: number;
}>;

export type CheckoutResponse = Readonly<{
  success: boolean;
  order: Order;
  paystackAuthorizationUrl?: string;
  paystackReference?: string;
}>;

export type PaystackInitializeInput = Readonly<{
  orderId: OrderId;
  email: string;
  amountNgn: number;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}>;

export type PaystackInitializeResponse = Readonly<{
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}>;

export type PaystackWebhookPayload = Readonly<{
  event: "charge.success" | "transfer.success" | "transfer.failed" | string;
  data: Readonly<{
    id?: number;
    reference: string;
    amount: number; // In kobo
    currency?: string;
    status: string;
    channel?: string;
    paid_at?: string;
    customer?: {
      email?: string;
      customer_code?: string;
    };
    metadata?: Record<string, unknown>;
  }>;
}>;

export type PlatformKillswitchInput = Readonly<{
  enabled: boolean;
  reason?: string;
  adminId: string;
}>;

export type PlatformKillswitchStatus = Readonly<{
  killswitchActive: boolean;
  reason?: string;
  updatedAt: string;
  updatedBy: string;
}>;
