import type { Dish, MenuOffer } from "./catalog";
import type { Order } from "./commerce";
import type { AreaId, VendorId } from "./ids";
import type { MealDrop } from "./meal-drop";
import type { Money } from "./money";
import type { SocialPost } from "./social";
import type { Vendor } from "./vendor";

export type AdminAccess = Readonly<{ name: string; role: "super_admin"; workspaceReady: boolean }>;
export type AdminVendorReview = Readonly<{ vendor: Vendor; status: "approved" | "pending_review" | "paused"; submittedAt: string; reviewNote: string }>;
export type AdminCustomerRecord = Readonly<{ id: string; name: string; email: string; orderCount: number; status: "active" | "restricted"; joinedAt: string }>;
export type AdminOrderReview = Readonly<{ order: Order; interventionStatus: "none" | "needs_review" | "dispute_open"; adminNote?: string }>;
export type AdminDispute = Readonly<{ id: string; orderId: string; customerName: string; topic: string; status: "open" | "under_review" | "resolved"; openedAt: string }>;
export type AdminModerationItem = Readonly<{ id: string; kind: "dish" | "meal_drop" | "post"; title: string; vendorName: string; status: "visible" | "pending_review" | "flagged"; reason?: string }>;
export type AdminDeliveryZone = Readonly<{ areaId: AreaId; name: string; enabled: boolean; activeVendors: number; customerDemand: "high" | "steady" | "low" }>;
export type AdminFinancePreview = Readonly<{ periodLabel: string; grossOrderValue: Money; platformRevenue: Money; refundExposure: Money; pendingSettlementPreview: Money; note: string }>;
export type AdminAnalyticsPreview = Readonly<{ periodLabel: string; activeCustomers: number; activeVendors: number; completedOrders: number; completionRate: number; topArea: string }>;
export type AdminRoleRecord = Readonly<{ id: string; name: string; email: string; role: "super_admin" | "operations" | "support"; status: "active" | "invited" }>;
export type AdminAuditEntry = Readonly<{ id: string; actor: string; action: string; target: string; occurredAt: string; preview: boolean }>;
export type AdminPlatformSettings = Readonly<{ maintenanceBannerEnabled: boolean; vendorReviewRequired: boolean; supportEmail: string; orderServiceFeeLabel: string }>;

export type AdminDashboardSnapshot = Readonly<{
  access: AdminAccess;
  overview: Readonly<{ pendingVendorReviews: number; openDisputes: number; ordersNeedingReview: number; flaggedContent: number }>;
  vendors: readonly AdminVendorReview[];
  customers: readonly AdminCustomerRecord[];
  orders: readonly AdminOrderReview[];
  disputes: readonly AdminDispute[];
  moderation: readonly AdminModerationItem[];
  catalog: readonly Readonly<{ dish: Dish; offer: MenuOffer; vendor: Vendor }> [];
  mealDrops: readonly Readonly<{ mealDrop: MealDrop; vendor: Vendor }> [];
  posts: readonly Readonly<{ post: SocialPost; vendor: Vendor }> [];
  deliveryZones: readonly AdminDeliveryZone[];
  finance: AdminFinancePreview;
  analytics: AdminAnalyticsPreview;
  roles: readonly AdminRoleRecord[];
  auditLog: readonly AdminAuditEntry[];
  settings: AdminPlatformSettings;
}>;
