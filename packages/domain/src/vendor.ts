import type { VendorId } from "./ids";

export type Vendor = Readonly<{
  id: VendorId;
  slug: string;
  name: string;
  handle: string;
  description: string;
  publicArea: string;
  category: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  coverUrl: string;
  acceptsOrders: boolean;
  fulfillmentModes: readonly ("delivery" | "pickup")[];
}>;
