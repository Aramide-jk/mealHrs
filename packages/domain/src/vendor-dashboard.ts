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
  minimumOrder: Money;
  immediateEnabled: boolean;
  scheduledEnabled: boolean;
}>;

export type VendorPickupSettings = Readonly<{
  mode: "delivery" | "pickup" | "both";
  addressNote: string;
  windowNote: string;
}>;

export type VendorVerificationPreview = Readonly<{
  status: "approved" | "pending_review" | "needs_info";
  accountVerified: boolean;
  businessReviewed: boolean;
  foodSafetyCertified: boolean;
  reviewerNote: string;
  documents: readonly Readonly<{
    id: string;
    label: string;
    detail: string;
    status: "verified" | "submitted" | "required";
  }>[];
}>;

export type VendorOperatingHour = Readonly<{
  day: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}>;

export type VendorOperatingSchedule = Readonly<{
  weeklyHours: readonly VendorOperatingHour[];
  maxSimultaneousOrders: number;
  pauseImmediate: boolean;
  pausePreorders: boolean;
  specialClosureNote: string;
}>;

export type VendorCustomerRecord = Readonly<{
  id: string;
  name: string;
  area: string;
  orderCount: number;
  lastOrderAt: string;
  totalSpent: Money;
  favoriteDish: string;
  isFollower: boolean;
  lastFeedback?: string;
  note?: string;
}>;

export type VendorTeamRole = "owner" | "manager" | "kitchen_staff" | "content_manager";

export type VendorTeamMember = Readonly<{
  id: string;
  name: string;
  email: string;
  role: VendorTeamRole;
  status: "active" | "invited";
}>;

export type VendorTransactionRecord = Readonly<{
  id: string;
  reference: string;
  dateLabel: string;
  gross: Money;
  commission: Money;
  processingFee: Money;
  net: Money;
  status: "settled" | "pending_payout";
}>;

export type VendorPayoutAccountPreview = Readonly<{
  bankName: string;
  accountNumberMasked: string;
  accountName: string;
  settlementSchedule: string;
  verified: boolean;
}>;

export type VendorNotificationItem = Readonly<{
  id: string;
  category: "order" | "prep" | "cutoff" | "review" | "compliance";
  title: string;
  detail: string;
  timeLabel: string;
  unread: boolean;
  href: string;
}>;

export type VendorPostInsight = Readonly<{
  postId: SocialPostId;
  status: "published" | "scheduled" | "flagged";
  views: number;
  mealClicks: number;
  ordersAttributed: number;
  comments: readonly Readonly<{
    id: string;
    author: string;
    body: string;
    createdAt: string;
  }>[];
}>;

export type VendorEarningsPreview = Readonly<{
  periodLabel: string;
  grossSales: Money;
  platformFees: Money;
  processingFees: Money;
  adjustments: Money;
  refunds: Money;
  collectedAmount: Money;
  pendingPayoutAmount: Money;
  previewBalance: Money;
  note: string;
}>;

export type VendorAnalyticsPreview = Readonly<{
  periodLabel: string;
  orderCount: number;
  immediateOrdersCount: number;
  mealDropOrdersCount: number;
  repeatCustomerRate: number;
  averageOrderValue: Money;
  acceptanceRate: number;
  completionRate: number;
  topMeal: string;
  busyWindow: string;
  weeklyActivity: readonly Readonly<{ label: string; value: number }>[];
  topAreas: readonly Readonly<{ name: string; orders: number }>[];
}>;

export type VendorStorefrontSettings = Readonly<{
  displayName: string;
  slug: string;
  handle: string;
  category: string;
  description: string;
  publicArea: string;
  orderingHoursLabel: string;
  instagramHandle: string;
  contactPhone: string;
  accentPreset: "herb" | "warm" | "charcoal";
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
  verification: VendorVerificationPreview;
  overview: Readonly<{
    todaySales: Money;
    openImmediateOrders: number;
    upcomingMealDrops: number;
    activePosts: number;
    outstandingDeliveries: number;
    nextCutoffLabel: string;
    recentActivity: readonly Readonly<{ id: string; title: string; detail: string; timeLabel: string }>[];
  }>;
  immediateOrders: readonly VendorImmediateOrder[];
  mealDropOrders: readonly VendorMealDropOrder[];
  menu: readonly Readonly<{ dish: Dish; offer: MenuOffer }>[];
  mealDrops: readonly MealDrop[];
  posts: readonly SocialPost[];
  postInsights: readonly VendorPostInsight[];
  deliveryZones: readonly VendorDeliveryZone[];
  pickupSettings: VendorPickupSettings;
  operatingSchedule: VendorOperatingSchedule;
  customers: readonly VendorCustomerRecord[];
  teamMembers: readonly VendorTeamMember[];
  earnings: VendorEarningsPreview;
  transactions: readonly VendorTransactionRecord[];
  payoutAccount: VendorPayoutAccountPreview;
  analytics: VendorAnalyticsPreview;
  storefront: VendorStorefrontSettings;
  settings: VendorDashboardSettings;
  notifications: readonly VendorNotificationItem[];
  contentDrafts: readonly Readonly<{ id: SocialPostId; caption: string; linkedOfferId?: string; status: "draft" | "scheduled" }> [];
}>;
