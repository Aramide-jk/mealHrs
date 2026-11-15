import type { DishId, MealDropId, OfferId, VendorId } from "./ids";
import type { Money } from "./money";

export type Dish = Readonly<{
  id: DishId;
  vendorId: VendorId;
  name: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  imageUrls?: readonly string[];
  allergens: readonly string[];
  optionGroups: readonly DishOptionGroup[];
}>;

export type DishOptionGroup = Readonly<{
  id: string;
  name: string;
  required: boolean;
  selection: "single" | "multiple";
  choices: readonly DishOption[];
}>;

export type DishOption = Readonly<{
  id: string;
  name: string;
  priceDelta: Money;
  available: boolean;
}>;

export type OfferAvailability =
  | Readonly<{ status: "available_now"; preparationEstimate: string }>
  | Readonly<{ status: "preorder"; cutoffAt: string; fulfillmentWindow: string }>
  | Readonly<{ status: "unavailable"; reason: string; nextAvailableAt?: string }>;

type MenuOfferBase = Readonly<{
  id: OfferId;
  dishId: DishId;
  vendorId: VendorId;
  price: Money;
  availableFulfillment: readonly ("delivery" | "pickup")[];
}>;

export type ImmediateMenuOffer = MenuOfferBase & Readonly<{
  orderingMode: "immediate";
  mealDropId?: never;
  availability:
    | Extract<OfferAvailability, { status: "available_now" }>
    | Extract<OfferAvailability, { status: "unavailable" }>;
}>;

export type MealDropMenuOffer = MenuOfferBase & Readonly<{
  orderingMode: "meal_drop";
  mealDropId: MealDropId;
  availability:
    | Extract<OfferAvailability, { status: "preorder" }>
    | Extract<OfferAvailability, { status: "unavailable" }>;
}>;

export type MenuOffer = ImmediateMenuOffer | MealDropMenuOffer;
