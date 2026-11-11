import { asAreaId, ngn, type AdminDashboardSnapshot } from "@mealhrs/domain";
import { dishes, mealDrops, offers, orders, posts, vendors } from "./data";

const vendorById = (vendorId: string) => vendors.find((vendor) => vendor.id === vendorId)!;
const catalog = offers.flatMap((offer) => {
  const dish = dishes.find((candidate) => candidate.id === offer.dishId);
  const vendor = vendorById(offer.vendorId);
  return dish && vendor ? [{ dish, offer, vendor }] : [];
});

export const adminDashboard: AdminDashboardSnapshot = {
  access: { name: "Nneka Okafor", role: "super_admin", workspaceReady: true },
  overview: { pendingVendorReviews: 1, openDisputes: 1, ordersNeedingReview: 1, flaggedContent: 1 },
  vendors: vendors.map((vendor, index) => ({ vendor, status: index === 1 ? "pending_review" : index === 2 ? "paused" : "approved", submittedAt: index === 1 ? "Today, 10:20 AM" : "Nov 3, 2026", reviewNote: index === 1 ? "Business details awaiting review." : index === 2 ? "Paused in this frontend scenario." : "Approved preview record." })),
  customers: [
    { id: "customer-teni", name: "Teni Adebayo", email: "teni@example.com", orderCount: 8, status: "active", joinedAt: "Sep 12, 2026" },
    { id: "customer-chidera", name: "Chidera Okafor", email: "chidera@example.com", orderCount: 2, status: "active", joinedAt: "Oct 18, 2026" },
    { id: "customer-adaeze", name: "Adaeze Nwosu", email: "adaeze@example.com", orderCount: 3, status: "restricted", joinedAt: "Oct 24, 2026" },
  ],
  orders: orders.map((order, index) => ({ order, interventionStatus: index === 0 ? "needs_review" : "none", ...(index === 0 ? { adminNote: "Delivery timing review requested in this preview." } : {}) })),
  disputes: [{ id: "dispute-mh-20481", orderId: "order-mh-20481", customerName: "Teni Adebayo", topic: "Delivery timing", status: "open", openedAt: "Today, 1:04 PM" }],
  moderation: [
    { id: "moderation-dish-jollof", kind: "dish", title: "Jollof Rice & Chicken", vendorName: "Amaka's Kitchen", status: "visible" },
    { id: "moderation-drop-egusi", kind: "meal_drop", title: "Sunday Egusi Table", vendorName: "Mama K's Soups", status: "pending_review", reason: "Scheduled batch review." },
    { id: "moderation-post-bakery", kind: "post", title: "Saturday pastry boxes", vendorName: "Butter & Crumb", status: "flagged", reason: "Caption needs a manual preview review." },
  ],
  catalog,
  mealDrops: mealDrops.map((mealDrop) => ({ mealDrop, vendor: vendorById(mealDrop.vendorId) })),
  posts: posts.map((post) => ({ post, vendor: vendorById(post.vendorId) })),
  deliveryZones: [
    { areaId: asAreaId("area-ikotun"), name: "Ikotun", enabled: true, activeVendors: 2, customerDemand: "high" },
    { areaId: asAreaId("area-egbe"), name: "Egbe", enabled: true, activeVendors: 1, customerDemand: "steady" },
    { areaId: asAreaId("area-ikeja"), name: "Ikeja", enabled: false, activeVendors: 0, customerDemand: "high" },
  ],
  finance: { periodLabel: "This week", grossOrderValue: ngn(498000), platformRevenue: ngn(36750), refundExposure: ngn(4950), pendingSettlementPreview: ngn(321200), note: "Preview only. No settlement, payout, or refund transfer is connected." },
  analytics: { periodLabel: "Last 7 days", activeCustomers: 128, activeVendors: 3, completedOrders: 94, completionRate: 96, topArea: "Ikotun" },
  roles: [{ id: "admin-nneka", name: "Nneka Okafor", email: "nneka@mealhrs.example", role: "super_admin", status: "active" }, { id: "admin-deji", name: "Deji Bello", email: "deji@mealhrs.example", role: "operations", status: "active" }, { id: "admin-sade", name: "Sade Yusuf", email: "sade@mealhrs.example", role: "support", status: "invited" }],
  auditLog: [{ id: "audit-1", actor: "Nneka Okafor", action: "Reviewed order", target: "MH-20481", occurredAt: "Today, 1:08 PM", preview: true }, { id: "audit-2", actor: "Deji Bello", action: "Opened vendor review", target: "Mama K's Soups", occurredAt: "Today, 10:22 AM", preview: true }],
  settings: { maintenanceBannerEnabled: false, vendorReviewRequired: true, supportEmail: "support@mealhrs.example", orderServiceFeeLabel: "Service charge" },
};
