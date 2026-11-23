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
  .map((order, index) => {
    const items = order.items.map((item) =>
      index === 0
        ? {
            ...item,
            instructions: "Please keep the plantain separate.",
            selectedOptions: [
              ...item.selectedOptions,
              { name: "Extra", value: "Fried plantain", priceDelta: ngn(500) },
            ],
          }
        : item,
    );
    const subtotal = items.reduce((sum, item) => {
      const optionTotal = item.selectedOptions.reduce((acc, option) => acc + option.priceDelta.amount, 0);
      return sum + (item.unitPrice.amount + optionTotal) * item.quantity;
    }, 0);
    const total = subtotal + order.deliveryFee.amount + order.serviceFee.amount;
    return {
      ...order,
      items,
      subtotal: ngn(subtotal),
      total: ngn(total),
      customer: {
        name: index === 0 ? "Teni Adebayo" : "Chidera Okafor",
        phoneMasked: index === 0 ? "+234 80••• 5412" : "+234 80••• 9134",
      },
      ...(index === 0 ? { operationalNote: "Call only if the delivery window changes." } : {}),
      operational: {
        ageLabel: index === 0 ? "Placed 14 min ago" : "October 24 · Completed",
        priority: index === 0 ? ("due_soon" as const) : ("normal" as const),
        paymentLabel: "Paid — frontend preview",
        fulfillmentDetail: "12 Community Road, Ikotun",
        contactLabel: "Contact customer (preview)",
      },
    };
  });

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
  onboarding: {
    status: "ready",
    completedSteps: ["profile", "fulfillment", "payout_preview", "first_menu"],
    nextStep: "Your kitchen is ready to receive orders.",
  },
  verification: {
    status: "approved",
    accountVerified: true,
    businessReviewed: true,
    foodSafetyCertified: false,
    reviewerNote:
      "Identity, Nigerian phone, and payout account verified in preview. Food-safety certificate remains optional for home kitchens until required by locality.",
    documents: [
      { id: "doc-id", label: "Owner identity (NIN / BVN match)", detail: "Matched to Amaka Okafor", status: "verified" },
      { id: "doc-phone", label: "Verified Nigerian contact number", detail: "+234 803 ••• 1190", status: "verified" },
      { id: "doc-payout", label: "Payout bank account verification", detail: "GTBank •••• 4821", status: "verified" },
      { id: "doc-hygiene", label: "Food hygiene & kitchen permit", detail: "Optional NAFDAC / Lagos state permit upload", status: "required" },
    ],
  },
  overview: {
    todaySales: ngn(28650),
    openImmediateOrders: 1,
    upcomingMealDrops: 1,
    activePosts: 1,
    outstandingDeliveries: 1,
    nextCutoffLabel: "Sunday Party Jollof · Batch prep 11:30 AM",
    recentActivity: [
      { id: "act-1", title: "Order MH-20481 is preparing", detail: "Teni Adebayo · 1× Jollof Rice & Chicken (+ Plantain)", timeLabel: "14 min ago" },
      { id: "act-2", title: "Pre-order MH-D118 confirmed", detail: "Adaeze Nwosu · 2 portions · Sunday 1:00–4:00 PM pickup", timeLabel: "Yesterday" },
      { id: "act-3", title: "Verified review posted on MH-19733", detail: "4.8 overall · “Carefully prepared and well packed.”", timeLabel: "Oct 24" },
    ],
  },
  immediateOrders,
  mealDropOrders,
  menu,
  mealDrops: mealDrops.filter((drop) => drop.vendorId === vendor.id),
  posts: posts.filter((post) => post.vendorId === vendor.id),
  postInsights: posts
    .filter((post) => post.vendorId === vendor.id)
    .map((post) => ({
      postId: post.id,
      status: "published" as const,
      views: 4820,
      mealClicks: 318,
      ordersAttributed: 19,
      comments: [
        { id: "c-1", author: "Teni A.", body: "The smoky jollof aroma never misses!", createdAt: "2h ago" },
        { id: "c-2", author: "Bola K.", body: "Do you deliver to Egbe today?", createdAt: "1h ago" },
      ],
    })),
  deliveryZones: [
    {
      areaId: asAreaId("area-ikotun"),
      name: "Ikotun",
      enabled: true,
      deliveryFee: ngn(1200),
      estimate: "35–50 min",
      minimumOrder: ngn(2500),
      immediateEnabled: true,
      scheduledEnabled: true,
    },
    {
      areaId: asAreaId("area-egbe"),
      name: "Egbe",
      enabled: true,
      deliveryFee: ngn(1400),
      estimate: "40–55 min",
      minimumOrder: ngn(3000),
      immediateEnabled: true,
      scheduledEnabled: true,
    },
    {
      areaId: asAreaId("area-ikeja"),
      name: "Ikeja",
      enabled: false,
      deliveryFee: ngn(0),
      estimate: "Not serving",
      minimumOrder: ngn(0),
      immediateEnabled: false,
      scheduledEnabled: false,
    },
  ],
  pickupSettings: {
    mode: "both",
    addressNote: "Shared privately only after an eligible pickup order is confirmed.",
    windowNote: "Daily 11:00 AM–7:30 PM",
    pickupAddress: "14 Adeola Odeku St, Victoria Island, Lagos",
    landmark: "Beside Silverbird Galleria",
  },
  operatingSchedule: {
    weeklyHours: [
      { day: "Monday", open: true, openTime: "10:00", closeTime: "20:00" },
      { day: "Tuesday", open: true, openTime: "10:00", closeTime: "20:00" },
      { day: "Wednesday", open: true, openTime: "10:00", closeTime: "20:00" },
      { day: "Thursday", open: true, openTime: "10:00", closeTime: "20:00" },
      { day: "Friday", open: true, openTime: "10:00", closeTime: "21:00" },
      { day: "Saturday", open: true, openTime: "11:00", closeTime: "21:00" },
      { day: "Sunday", open: true, openTime: "12:00", closeTime: "18:00" },
    ],
    maxSimultaneousOrders: 12,
    pauseImmediate: false,
    pausePreorders: false,
    specialClosureNote: "",
  },
  customers: [
    {
      id: "cust-teni",
      name: "Teni Adebayo",
      area: "Ikotun",
      orderCount: 8,
      lastOrderAt: "Today, 12:31 PM",
      totalSpent: ngn(42600),
      favoriteDish: "Jollof Rice & Chicken",
      isFollower: true,
      lastFeedback: "“Carefully prepared, well packed and exactly as described.”",
      note: "Prefers plantain packed separately.",
    },
    {
      id: "cust-chidera",
      name: "Chidera Okafor",
      area: "Ikotun",
      orderCount: 3,
      lastOrderAt: "Oct 24",
      totalSpent: ngn(14850),
      favoriteDish: "Jollof Rice & Chicken",
      isFollower: true,
      lastFeedback: "“Generous portions and arrived hot.”",
    },
    {
      id: "cust-adaeze",
      name: "Adaeze Nwosu",
      area: "Egbe",
      orderCount: 2,
      lastOrderAt: "Yesterday",
      totalSpent: ngn(19000),
      favoriteDish: "Sunday Party Jollof Meal Drop",
      isFollower: false,
      note: "Usually picks up after 1:30 PM on Sundays.",
    },
  ],
  teamMembers: [
    { id: "tm-amaka", name: "Amaka Okafor", email: "amaka@amakaskitchen.example", role: "owner", status: "active" },
    { id: "tm-kemi", name: "Kemi Balogun", email: "kemi@amakaskitchen.example", role: "kitchen_staff", status: "active" },
    { id: "tm-tunde", name: "Tunde Adeyemi", email: "tunde@amakaskitchen.example", role: "content_manager", status: "invited" },
  ],
  earnings: {
    periodLabel: "This week",
    grossSales: ngn(184500),
    platformFees: ngn(9225),
    processingFees: ngn(3275),
    adjustments: ngn(0),
    refunds: ngn(0),
    collectedAmount: ngn(142500),
    pendingPayoutAmount: ngn(29500),
    previewBalance: ngn(172000),
    note: "Preview only. Settlement and payout transfers are not connected.",
  },
  transactions: [
    {
      id: "txn-1",
      reference: "MH-20481",
      dateLabel: "Today, 12:31 PM",
      gross: ngn(5450),
      commission: ngn(272),
      processingFee: ngn(182),
      net: ngn(4996),
      status: "pending_payout",
    },
    {
      id: "txn-2",
      reference: "MH-D118",
      dateLabel: "Yesterday, 1:10 PM",
      gross: ngn(9500),
      commission: ngn(475),
      processingFee: ngn(243),
      net: ngn(8782),
      status: "pending_payout",
    },
    {
      id: "txn-3",
      reference: "MH-19733",
      dateLabel: "Oct 24, 12:12 PM",
      gross: ngn(4950),
      commission: ngn(248),
      processingFee: ngn(174),
      net: ngn(4528),
      status: "settled",
    },
  ],
  payoutAccount: {
    bankName: "Guaranty Trust Bank (GTBank)",
    accountNumberMasked: "•••• 4821",
    accountName: "Amaka Okafor Kitchen Ventures",
    settlementSchedule: "Next business day (T+1 preview)",
    verified: true,
  },
  analytics: {
    periodLabel: "Last 7 days",
    orderCount: 46,
    immediateOrdersCount: 31,
    mealDropOrdersCount: 15,
    repeatCustomerRate: 34,
    averageOrderValue: ngn(4011),
    acceptanceRate: 98,
    completionRate: 96,
    topMeal: "Jollof Rice & Chicken",
    busyWindow: "12:00–2:00 PM",
    weeklyActivity: [
      { label: "Mon", value: 54 },
      { label: "Tue", value: 38 },
      { label: "Wed", value: 70 },
      { label: "Thu", value: 61 },
      { label: "Fri", value: 88 },
      { label: "Sat", value: 100 },
      { label: "Sun", value: 78 },
    ],
    topAreas: [
      { name: "Ikotun", orders: 29 },
      { name: "Egbe", orders: 17 },
    ],
  },
  storefront: {
    displayName: vendor.name,
    slug: vendor.slug,
    handle: vendor.handle,
    category: vendor.category,
    description: vendor.description,
    publicArea: vendor.publicArea,
    orderingHoursLabel: "Mon–Sat 10:00 AM–8:00 PM · Sun 12:00–6:00 PM",
    instagramHandle: "@amakaskitchen.ng",
    contactPhone: "+234 803 000 1190",
    accentPreset: "herb",
    acceptsOrders: vendor.acceptsOrders,
    coverUrl: vendor.coverUrl,
    avatarUrl: "/assets/approved-reels-reference.png",
    announcementNotice: "Weekend party jollof pre-orders close every Friday at 6:00 PM.",
    announcementEnabled: true,
    specialtyTags: ["100% Homemade", "Halal", "Party Catering", "No MSG"],
    whatsAppPhone: "+234 803 000 1190",
  },
  settings: {
    orderNotifications: true,
    mealDropReminders: true,
    defaultPreparationEstimate: "25–35 min",
    supportEmail: "support@mealhrs.example",
    autoAcceptOrders: false,
    whatsAppNotifications: true,
    smsNotifications: true,
    emailDigest: true,
  },
  notifications: [
    {
      id: "vn-1",
      category: "order",
      title: "Order MH-20481 needs preparation update",
      detail: "Teni Adebayo · 1× Jollof Rice & Chicken (+ Fried plantain) · Ikotun delivery.",
      timeLabel: "14 min ago",
      unread: true,
      href: "/vendor/orders",
    },
    {
      id: "vn-2",
      category: "prep",
      title: "Sunday Party Jollof batch summary ready",
      detail: "2 portions reserved so far for pickup window 1:00–4:00 PM.",
      timeLabel: "1 hour ago",
      unread: true,
      href: "/vendor/orders",
    },
    {
      id: "vn-3",
      category: "review",
      title: "New verified review on MH-19733",
      detail: "Teni rated 4.8 stars: “Carefully prepared, well packed and exactly as described.”",
      timeLabel: "Oct 24",
      unread: false,
      href: "/vendor/customers",
    },
    {
      id: "vn-4",
      category: "compliance",
      title: "Food hygiene documentation optional reminder",
      detail: "Upload a Lagos food-safety certificate to display certification status.",
      timeLabel: "Nov 3",
      unread: false,
      href: "/vendor/verification",
    },
  ],
  contentDrafts: [
    {
      id: asSocialPostId("draft-sunday-menu"),
      caption: "Sunday lunch is coming together.",
      linkedOfferId: offers[1]!.id,
      status: "draft",
    },
  ],
};
