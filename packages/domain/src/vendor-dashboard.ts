import type { Dish, MenuOffer } from "./catalog";
import type { Order } from "./commerce";
import type { AreaId, SocialPostId } from "./ids";
import type { MealDrop } from "./meal-drop";
import type { Money } from "./money";
import type { SocialPost } from "./social";
import type { Vendor } from "./vendor";

export type VendorOnboardingStatus = "not_started" | "in_progress" | "ready";

export type VendorOnboarding = Readonly<{
  status: VendorOnboardingStatus;
  completedSteps: readonly ("profile" | "fulfillment" | "payout_preview" | "first_menu")[];
  nextStep: string;
}>;

export type VendorOrder = Order & Readonly<{
  customer: Readonly<{ name: string; phoneMasked: string }>;
  operationalNote?: string;
  operational: Readonly<{
    ageLabel: string;
    priority: "normal" | "due_soon" | "attention";
    paymentLabel: string;
    fulfillmentDetail: string;
    contactLabel: string;
    mealDrop?: Readonly<{
      name: string;
      preparationWindow: string;
      cutoffLabel: string;
      capacityLabel: string;
      summary: string;
    }>;
  }>;
}>;

export type VendorImmediateOrder = Omit<VendorOrder, "orderingMode"> & Readonly<{
  orderingMode: "immediate";
}>;

export type VendorMealDropOrder = Omit<VendorOrder, "orderingMode"> & Readonly<{
  orderingMode: "meal_drop";
}>;

export type VendorDeliveryZone = Readonly<{
  areaId: AreaId;
  name: string;
  enabled: boolean;
  deliveryFee: Money;
  estimate: string;
}>;

export type VendorEarningsPreview = Readonly<{
  periodLabel: string;
  grossSales: Money;
  platformFees: Money;
  refunds: Money;
  previewBalance: Money;
  note: string;
}>;

export type VendorAnalyticsPreview = Readonly<{
  periodLabel: string;
  orderCount: number;
  repeatCustomerRate: number;
  averageOrderValue: Money;
  topMeal: string;
  busyWindow: string;
}>;

export type VendorStorefrontSettings = Readonly<{
  displayName: string;
  handle: string;
  description: string;
  publicArea: string;
  acceptsOrders: boolean;
  coverUrl: string;
}>;

export type VendorDashboardSettings = Readonly<{
  orderNotifications: boolean;
  mealDropReminders: boolean;
  defaultPreparationEstimate: string;
  supportEmail: string;
}>;

export type VendorDashboardSnapshot = Readonly<{
  vendor: Vendor;
  onboarding: VendorOnboarding;
  overview: Readonly<{
    todaySales: Money;
    openImmediateOrders: number;
    upcomingMealDrops: number;
    activePosts: number;
  }>;
  immediateOrders: readonly VendorImmediateOrder[];
  mealDropOrders: readonly VendorMealDropOrder[];
  menu: readonly Readonly<{ dish: Dish; offer: MenuOffer }>[];
  mealDrops: readonly MealDrop[];
  posts: readonly SocialPost[];
  deliveryZones: readonly VendorDeliveryZone[];
  earnings: VendorEarningsPreview;
  analytics: VendorAnalyticsPreview;
  storefront: VendorStorefrontSettings;
  settings: VendorDashboardSettings;
  contentDrafts: readonly Readonly<{ id: SocialPostId; caption: string; linkedOfferId?: string; status: "draft" | "scheduled" }> [];
}>;
