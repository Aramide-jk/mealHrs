import type { Dish, MenuOffer } from "./catalog";
import type { Order } from "./commerce";
import { asAreaId, type AreaId, type VendorId } from "./ids";
import type { MealDrop } from "./meal-drop";
import type { Money } from "./money";
import type { SocialPost } from "./social";
import type { Vendor } from "./vendor";

export type AdminAccess = Readonly<{ name: string; role: "super_admin" | "operations" | "support" | "finance"; workspaceReady: boolean }>;
export type AdminVendorCompliance = Readonly<{
  cacNumber: string;
  foodSafetyCertified: boolean;
  hygieneCertNumber: string;
  kitchenAddress: string;
  managerPhone: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  kitchenPhotoUrl?: string | undefined;
}>;
export type AdminVendorReview = Readonly<{
  vendor: Vendor;
  status: "approved" | "pending_review" | "paused";
  submittedAt: string;
  reviewNote: string;
  compliance?: AdminVendorCompliance | undefined;
  rejectionReason?: string | undefined;
}>;
export type AdminCustomerRecord = Readonly<{
  id: string;
  name: string;
  email: string;
  orderCount: number;
  status: "active" | "restricted";
  joinedAt: string;
  phone?: string | undefined;
  ltv?: Money | undefined;
  addresses?: readonly string[] | undefined;
  restrictionReason?: string | undefined;
}>;
export type AdminOrderInterventionDetails = Readonly<{
  reassignedCourier?: Readonly<{ name: string; phone: string; fleet: string }> | undefined;
  prepBufferMinutes?: number | undefined;
  cancellationReason?: string | undefined;
  adminActionNote?: string | undefined;
}>;
export type AdminOrderReview = Readonly<{
  order: Order;
  interventionStatus: "none" | "needs_review" | "dispute_open";
  adminNote?: string | undefined;
  interventionDetails?: AdminOrderInterventionDetails | undefined;
}>;
export type AdminDisputeResolution = Readonly<{
  resolutionType: "full_refund" | "partial_refund" | "voucher" | "dismissed";
  refundAmount?: Money | undefined;
  deductionSource: "vendor_payout" | "platform_goodwill";
  note?: string | undefined;
}>;
export type AdminDispute = Readonly<{
  id: string;
  orderId: string;
  customerName: string;
  topic: string;
  status: "open" | "under_review" | "resolved";
  openedAt: string;
  claimDetails?: string | undefined;
  evidenceImageUrl?: string | undefined;
  resolution?: AdminDisputeResolution | undefined;
}>;
export type AdminModerationItem = Readonly<{
  id: string;
  kind: "dish" | "meal_drop" | "post" | "review";
  title: string;
  vendorName: string;
  status: "visible" | "pending_review" | "flagged";
  reason?: string | undefined;
  mediaUrl?: string | undefined;
  reviewComment?: string | undefined;
  flagReasonTag?: string | undefined;
}>;
export type AdminDeliveryZone = Readonly<{
  areaId: AreaId;
  name: string;
  state?: string | undefined;
  enabled: boolean;
  activeVendors: number;
  customerDemand: "high" | "steady" | "low";
  baseDeliveryFee?: Money | undefined;
  maxRadiusKm?: number | undefined;
  surgeActive?: boolean | undefined;
  isAutoDiscovered?: boolean | undefined;
}>;
export type AdminVendorPayoutRecord = Readonly<{
  vendorId: string;
  vendorName: string;
  orderCount: number;
  grossAmount: Money;
  feeAmount: Money;
  netPayout: Money;
  bankName: string;
  accountNumber: string;
  status: "pending" | "processing" | "settled";
}>;
export type AdminFinancePreview = Readonly<{
  periodLabel: string;
  grossOrderValue: Money;
  platformRevenue: Money;
  refundExposure: Money;
  pendingSettlementPreview: Money;
  note: string;
  commissionRatePercent?: number | undefined;
  vendorPayouts?: readonly AdminVendorPayoutRecord[] | undefined;
}>;
export type AdminAnalyticsPreview = Readonly<{
  periodLabel: string;
  activeCustomers: number;
  activeVendors: number;
  completedOrders: number;
  completionRate: number;
  topArea: string;
  avgPrepMinutes?: number | undefined;
  avgTransitMinutes?: number | undefined;
  topDishes?: readonly Readonly<{ name: string; vendorName: string; ordersCount: number; grossSales: Money }>[] | undefined;
}>;
export type AdminRoleRecord = Readonly<{
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "operations" | "support" | "finance";
  status: "active" | "invited";
}>;
export type AdminAuditEntry = Readonly<{
  id: string;
  actor: string;
  action: string;
  target: string;
  occurredAt: string;
  preview: boolean;
  category?: "vendor" | "dispute" | "order" | "delivery" | "finance" | "settings" | "security" | undefined;
}>;
export type AdminPlatformSettings = Readonly<{
  maintenanceBannerEnabled: boolean;
  emergencyKillSwitchEnabled?: boolean | undefined;
  emergencyNotice?: string | undefined;
  vendorReviewRequired: boolean;
  supportEmail: string;
  orderServiceFeeLabel: string;
  minOrderValue?: Money | undefined;
}>;

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

const COMMON_CITY_STATE: Record<string, string> = {
  abuja: "Abuja (FCT)",
  fct: "Abuja (FCT)",
  wuse: "Abuja (FCT)",
  garki: "Abuja (FCT)",
  maitama: "Abuja (FCT)",
  asokoro: "Abuja (FCT)",
  jabi: "Abuja (FCT)",
  gwarinpa: "Abuja (FCT)",
  ibadan: "Oyo",
  bodija: "Oyo",
  oluyole: "Oyo",
  dugbe: "Oyo",
  "port harcourt": "Rivers",
  ph: "Rivers",
  "old gra": "Rivers",
  diobu: "Rivers",
  ikotun: "Lagos",
  egbe: "Lagos",
  ikeja: "Lagos",
  lekki: "Lagos",
  surulere: "Lagos",
  yaba: "Lagos",
  enugu: "Enugu",
  kano: "Kano",
  "benin city": "Edo",
  asaba: "Delta",
  warri: "Delta",
  calabar: "Cross River",
  uyo: "Akwa Ibom",
  abeokuta: "Ogun",
  jos: "Plateau",
};

export function parseVendorLocation(
  publicArea: string,
  kitchenAddress?: string,
): { neighborhood: string; state: string } {
  const target = publicArea.trim() || (kitchenAddress ?? "Lagos");
  const parts = target.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 2) {
    const neighborhood = parts[0]!;
    const stateCandidate = parts[parts.length - 1]!.toLowerCase();
    const state = COMMON_CITY_STATE[stateCandidate] ?? (parts[parts.length - 1]!.length > 2 ? parts[parts.length - 1]! : "Lagos");
    return { neighborhood, state };
  }

  const single = parts[0] ?? "Lagos";
  const state = COMMON_CITY_STATE[single.toLowerCase()] ?? "Lagos";
  return { neighborhood: single, state };
}

export function deriveCoverageHubs(
  baseZones: readonly AdminDeliveryZone[],
  vendors: readonly AdminVendorReview[],
): readonly AdminDeliveryZone[] {
  const result: AdminDeliveryZone[] = [];
  const processedKeys = new Set<string>();

  // 1. Process base zones (seeded or admin-created)
  for (const zone of baseZones) {
    const normName = zone.name.toLowerCase();
    const matchingVendors = vendors.filter((v) => {
      const areaMatch = v.vendor.publicArea.toLowerCase().includes(normName);
      const addrMatch = v.compliance?.kitchenAddress?.toLowerCase().includes(normName) ?? false;
      return (areaMatch || addrMatch) && v.status !== "paused";
    });

    const activeVendors = Math.max(zone.activeVendors, matchingVendors.length);
    result.push({
      ...zone,
      activeVendors,
    });
    processedKeys.add(`${(zone.state ?? "lagos").toLowerCase()}:${normName}`);
  }

  // 2. Auto-discover hubs from registered vendors that are not yet in baseZones
  for (const item of vendors) {
    const { neighborhood, state } = parseVendorLocation(
      item.vendor.publicArea,
      item.compliance?.kitchenAddress,
    );
    const key = `${state.toLowerCase()}:${neighborhood.toLowerCase()}`;

    // Check if this neighborhood was already covered in existing zones
    const alreadyCovered = Array.from(processedKeys).some((k) =>
      k.includes(neighborhood.toLowerCase()) || neighborhood.toLowerCase().includes(k.split(":")[1] ?? ""),
    );

    if (!alreadyCovered && !processedKeys.has(key)) {
      processedKeys.add(key);
      const slug = neighborhood.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
      const activeCount = vendors.filter((v) => {
        const areaMatch = v.vendor.publicArea.toLowerCase().includes(neighborhood.toLowerCase());
        const addrMatch = v.compliance?.kitchenAddress?.toLowerCase().includes(neighborhood.toLowerCase()) ?? false;
        return (areaMatch || addrMatch) && v.status !== "paused";
      }).length;

      result.push({
        areaId: asAreaId(`area-${slug}`),
        name: neighborhood,
        state,
        enabled: true,
        activeVendors: Math.max(1, activeCount),
        customerDemand: activeCount > 1 ? "high" : "steady",
        isAutoDiscovered: true,
      });
    }
  }

  return result;
}
