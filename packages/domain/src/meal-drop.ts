import type { DishId, MealDropId, OfferId, VendorId } from "./ids";

export type MealDropStatus = "upcoming" | "open" | "cutoff_passed" | "sold_out" | "cancelled";

export type MealDrop = Readonly<{
  id: MealDropId;
  vendorId: VendorId;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  timezone: "Africa/Lagos";
  cutoffAt: string;
  fulfillmentDate: string;
  fulfillmentWindow: string;
  status: MealDropStatus;
  capacity: number;
  remainingCapacity: number;
  items: readonly MealDropItem[];
}>;

export type MealDropItem = Readonly<{
  dishId: DishId;
  offerId: OfferId;
  quantityLimit: number;
}>;
