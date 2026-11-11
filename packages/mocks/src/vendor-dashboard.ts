import { asAreaId, asOrderId, asSocialPostId, ngn, type Order, type VendorDashboardSnapshot, type VendorImmediateOrder, type VendorMealDropOrder } from "@mealhrs/domain";
import { dishes, mealDrops, offers, orders, posts, vendors } from "./data";

const vendor = vendors[0]!;
const menu = offers.flatMap((offer) => {
  if (offer.vendorId !== vendor.id) return [];
  const dish = dishes.find((candidate) => candidate.id === offer.dishId);
  return dish ? [{ dish, offer }] : [];
});

const isImmediateVendorOrder = (order: Order): order is Order & Readonly<{ orderingMode: "immediate" }> => order.vendorId === vendor.id && order.orderingMode === "immediate";

const immediateOrders: readonly VendorImmediateOrder[] = orders
  .filter(isImmediateVendorOrder)
  .map((order, index) => ({
    ...order,
    items: order.items.map((item) => index === 0 ? { ...item, instructions: "Please keep the plantain separate.", selectedOptions: [...item.selectedOptions, { name: "Extra", value: "Fried plantain", priceDelta: ngn(500) }] } : item),
    customer: { name: index === 0 ? "Teni Adebayo" : "Chidera Okafor", phoneMasked: "+234 80••• 5412" },
    ...(index === 0 ? { operationalNote: "Call only if the delivery window changes." } : {}),
    operational: {
      ageLabel: index === 0 ? "Placed 14 min ago" : "Placed 26 min ago",
      priority: index === 0 ? ("due_soon" as const) : ("normal" as const),
      paymentLabel: "Paid — frontend preview",
      fulfillmentDetail: index === 0 ? "12 Community Road, Ikotun" : "Kitchen pickup counter",
      contactLabel: "Contact customer (preview)",
    },
  }));

const mealDropOrders = [{
  id: asOrderId("order-mh-drop-118"),
  reference: "MH-D118",
  vendorId: vendor.id,
  vendorName: vendor.name,
  orderingMode: "meal_drop" as const,
  fulfillmentMode: "pickup" as const,
  items: [{ id: "drop-order-jollof", dishId: dishes[0]!.id, offerId: offers[1]!.id, name: dishes[0]!.name, imageUrl: dishes[0]!.imageUrl, unitPrice: ngn(4500), quantity: 2, selectedOptions: [{ name: "Protein", value: "Grilled chicken", priceDelta: ngn(0) }], instructions: "Pack both portions together." }],
  paymentStatus: "paid" as const,
  orderStatus: "confirmed" as const,
  fulfillmentStatus: "scheduled" as const,
  fulfillmentWindow: "Sunday, 1:00–4:00 PM",
  subtotal: ngn(9000),
  deliveryFee: ngn(0),
  serviceFee: ngn(500),
  total: ngn(9500),
  createdAt: "2026-11-07T13:10:00+01:00",
  events: [{ label: "Pre-order confirmed", occurredAt: "1:10 PM", detail: "Scheduled for the Sunday Meal Drop." }],
  customer: { name: "Adaeze Nwosu", phoneMasked: "+234 81••• 2820" },
  operationalNote: "Two portions; pickup after 1:30 PM.",
  operational: {
    ageLabel: "Pre-ordered yesterday",
    priority: "normal",
    paymentLabel: "Paid — frontend preview",
    fulfillmentDetail: "Pickup counter after 1:30 PM",
    contactLabel: "Contact customer (preview)",
    mealDrop: {
      name: "Sunday Party Jollof Meal Drop",
      preparationWindow: "Batch prep starts Sunday, 11:30 AM",
      cutoffLabel: "Pre-orders closed Friday, 6:00 PM",
      capacityLabel: "23 of 40 portions reserved",
      summary: "1 active pre-order · 2 portions to prepare",
    },
  },
}] as const satisfies readonly VendorMealDropOrder[];

export const vendorDashboard: VendorDashboardSnapshot = {
  vendor,
  onboarding: { status: "ready", completedSteps: ["profile", "fulfillment", "payout_preview", "first_menu"], nextStep: "Your kitchen is ready to receive orders." },
  overview: { todaySales: ngn(28650), openImmediateOrders: 1, upcomingMealDrops: 1, activePosts: 1 },
  immediateOrders,
  mealDropOrders,
  menu,
  mealDrops: mealDrops.filter((drop) => drop.vendorId === vendor.id),
  posts: posts.filter((post) => post.vendorId === vendor.id),
  deliveryZones: [
    { areaId: asAreaId("area-ikotun"), name: "Ikotun", enabled: true, deliveryFee: ngn(1200), estimate: "35–50 min" },
    { areaId: asAreaId("area-egbe"), name: "Egbe", enabled: true, deliveryFee: ngn(1400), estimate: "40–55 min" },
    { areaId: asAreaId("area-ikeja"), name: "Ikeja", enabled: false, deliveryFee: ngn(0), estimate: "Not serving" },
  ],
  earnings: { periodLabel: "This week", grossSales: ngn(184500), platformFees: ngn(12500), refunds: ngn(0), previewBalance: ngn(172000), note: "Preview only. Settlement and payout transfers are not connected." },
  analytics: { periodLabel: "Last 7 days", orderCount: 46, repeatCustomerRate: 34, averageOrderValue: ngn(4011), topMeal: "Jollof Rice & Chicken", busyWindow: "12:00–2:00 PM" },
  storefront: { displayName: vendor.name, handle: vendor.handle, description: vendor.description, publicArea: vendor.publicArea, acceptsOrders: vendor.acceptsOrders, coverUrl: vendor.coverUrl },
  settings: { orderNotifications: true, mealDropReminders: true, defaultPreparationEstimate: "25–35 min", supportEmail: "support@mealhrs.example" },
  contentDrafts: [{ id: asSocialPostId("draft-sunday-menu"), caption: "Sunday lunch is coming together.", linkedOfferId: offers[1]!.id, status: "draft" }],
};
