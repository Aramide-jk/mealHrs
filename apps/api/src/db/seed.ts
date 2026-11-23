import { sql } from "drizzle-orm";
import { runMigrations } from "./migrate";
import {
  getDb,
  usersTable,
  vendorsTable,
  vendorDeliveryZonesTable,
  dishesTable,
  mealDropsTable,
  ordersTable,
  coverageHubsTable,
  auditLogsTable,
} from "./index";

export async function seedDatabase() {
  console.log("Starting idempotent database seeding...");
  const db = getDb();

  // 1. Ensure migrations / schema exist
  await runMigrations();

  // 2. Safe teardown for idempotency (executed in child-to-parent order)
  await db.delete(auditLogsTable);
  await db.delete(coverageHubsTable);
  await db.delete(ordersTable);
  await db.delete(mealDropsTable);
  await db.delete(dishesTable);
  await db.delete(vendorDeliveryZonesTable);
  await db.delete(vendorsTable);
  await db.delete(usersTable);

  // 3. Seed Users (Customers, Vendors, Admins)
  await db.insert(usersTable).values([
    {
      id: "customer-teni",
      name: "Teni Adebayo",
      email: "teni@example.com",
      phone: "+234 803 123 4567",
      role: "customer",
      status: "active",
    },
    {
      id: "customer-chidera",
      name: "Chidera Okafor",
      email: "chidera@example.com",
      phone: "+234 802 987 6543",
      role: "customer",
      status: "active",
    },
    {
      id: "customer-adaeze",
      name: "Adaeze Nwosu",
      email: "adaeze@example.com",
      phone: "+234 814 332 1199",
      role: "customer",
      status: "restricted",
    },
    {
      id: "admin-nneka",
      name: "Nneka Okafor",
      email: "nneka@mealhrs.com",
      phone: "+234 801 000 0001",
      role: "admin",
      status: "active",
    },
  ]);

  // 4. Seed Multi-State Nigerian Kitchens
  await db.insert(vendorsTable).values([
    {
      id: "vendor-amaka",
      slug: "amakas-kitchen",
      name: "Amaka's Kitchen",
      handle: "@AmakasKitchen",
      description: "Comforting Nigerian meals, cooked in small batches and packed with care.",
      publicArea: "Ikotun, Lagos",
      state: "Lagos",
      category: "Nigerian kitchen",
      verified: true,
      rating: "4.8",
      reviewCount: 86,
      avatarUrl: "/assets/hero-jollof.png",
      coverUrl: "/assets/hero-jollof.png",
      acceptsOrders: true,
      fulfillmentModes: '["delivery", "pickup"]',
      status: "approved",
      cacNumber: "RC-1849201",
      bankName: "Access Bank",
      accountNumber: "0123456789",
      accountName: "Amaka's Kitchen Ent",
      kitchenAddress: "14 Governor Road, Ikotun, Lagos",
    },
    {
      id: "vendor-mama-k",
      slug: "mama-ks-soups",
      name: "Mama K's Soups",
      handle: "@MamaKsSoups",
      description: "Rich local soups and fresh swallow for planned family meals.",
      publicArea: "Egbe, Lagos",
      state: "Lagos",
      category: "Soups & swallow",
      verified: true,
      rating: "4.7",
      reviewCount: 52,
      avatarUrl: "/assets/egusi-pounded-yam.png",
      coverUrl: "/assets/egusi-pounded-yam.png",
      acceptsOrders: true,
      fulfillmentModes: '["delivery"]',
      status: "approved",
      cacNumber: "BN-982143",
      bankName: "Guaranty Trust Bank",
      accountNumber: "0234567891",
      accountName: "Mama Kemi Soups",
      kitchenAddress: "8 College Road, Egbe, Lagos",
    },
    {
      id: "vendor-butter-crumb",
      slug: "butter-and-crumb",
      name: "Butter & Crumb",
      handle: "@ButterAndCrumb",
      description: "Slow-fermented bread and small-batch weekend pastries.",
      publicArea: "Surulere, Lagos",
      state: "Lagos",
      category: "Bakery",
      verified: true,
      rating: "4.9",
      reviewCount: 41,
      avatarUrl: "/assets/bakery-drop.png",
      coverUrl: "/assets/bakery-drop.png",
      acceptsOrders: true,
      fulfillmentModes: '["pickup"]',
      status: "approved",
      cacNumber: "RC-772109",
      bankName: "Zenith Bank",
      accountNumber: "0345678912",
      accountName: "Butter & Crumb Artisan Bakeries",
      kitchenAddress: "21 Adeniran Ogunsanya, Surulere, Lagos",
    },
    {
      id: "vendor-royal-suya",
      slug: "royal-suya-abuja",
      name: "Royal Suya & Grills",
      handle: "@RoyalSuyaAbuja",
      description: "Authentic Northern mai-suya smoked skewers, kilishi, and honey-glazed grills.",
      publicArea: "Wuse 2, Abuja",
      state: "Abuja (FCT)",
      category: "Grills & Suya",
      verified: true,
      rating: "4.9",
      reviewCount: 64,
      avatarUrl: "/assets/hero-jollof.png",
      coverUrl: "/assets/hero-jollof.png",
      acceptsOrders: true,
      fulfillmentModes: '["delivery", "pickup"]',
      status: "approved",
      cacNumber: "RC-223410",
      bankName: "United Bank for Africa",
      accountNumber: "1029384756",
      accountName: "Royal Suya & Spices Ltd",
      kitchenAddress: "Plot 12 Adetokunbo Ademola Crescent, Wuse 2, Abuja",
    },
    {
      id: "vendor-garden-city",
      slug: "garden-city-ph",
      name: "Garden City Flavors",
      handle: "@GardenCityPH",
      description: "Iconic Port Harcourt roasted plantain (Bole), fresh fish, and spicy pepper sauce.",
      publicArea: "Old GRA, Port Harcourt",
      state: "Rivers",
      category: "Bole & Seafood",
      verified: true,
      rating: "4.8",
      reviewCount: 39,
      avatarUrl: "/assets/egusi-pounded-yam.png",
      coverUrl: "/assets/egusi-pounded-yam.png",
      acceptsOrders: true,
      fulfillmentModes: '["delivery", "pickup"]',
      status: "approved",
      cacNumber: "RC-334190",
      bankName: "Stanbic IBTC",
      accountNumber: "3049586712",
      accountName: "Garden City Delicacies",
      kitchenAddress: "5 Tombia Street, Old GRA, Port Harcourt",
    },
    {
      id: "vendor-amala-skye",
      slug: "amala-skye-ibadan",
      name: "Amala Skye Bodija",
      handle: "@AmalaSkyeBodija",
      description: "Steaming hot piping amala, fresh gbegiri, ewedu, and tender goat meat.",
      publicArea: "Bodija, Ibadan",
      state: "Oyo",
      category: "Amala & Abula",
      verified: true,
      rating: "4.9",
      reviewCount: 112,
      avatarUrl: "/assets/hero-jollof.png",
      coverUrl: "/assets/hero-jollof.png",
      acceptsOrders: true,
      fulfillmentModes: '["delivery", "pickup"]',
      status: "approved",
      cacNumber: "RC-441098",
      bankName: "Wema Bank",
      accountNumber: "4059687123",
      accountName: "Oyo Heritage Foods Ltd",
      kitchenAddress: "14 Secretariat Road, Bodija, Ibadan",
    },
  ]);

  // 5. Seed Vendor Delivery Zones
  await db.insert(vendorDeliveryZonesTable).values([
    {
      id: "zone-amaka-ikotun",
      vendorId: "vendor-amaka",
      areaId: "area-ikotun",
      name: "Ikotun",
      state: "Lagos",
      enabled: true,
      deliveryFeeNgn: 800,
      estimate: "30–45 min",
      minimumOrderNgn: 2500,
      immediateEnabled: true,
      scheduledEnabled: true,
    },
    {
      id: "zone-amaka-egbe",
      vendorId: "vendor-amaka",
      areaId: "area-egbe",
      name: "Egbe",
      state: "Lagos",
      enabled: true,
      deliveryFeeNgn: 900,
      estimate: "35–50 min",
      minimumOrderNgn: 2500,
      immediateEnabled: true,
      scheduledEnabled: true,
    },
    {
      id: "zone-suya-wuse",
      vendorId: "vendor-royal-suya",
      areaId: "area-wuse",
      name: "Wuse 2",
      state: "Abuja (FCT)",
      enabled: true,
      deliveryFeeNgn: 1000,
      estimate: "25–40 min",
      minimumOrderNgn: 3000,
      immediateEnabled: true,
      scheduledEnabled: true,
    },
    {
      id: "zone-bole-ph",
      vendorId: "vendor-garden-city",
      areaId: "area-gra-ph",
      name: "Old GRA",
      state: "Rivers",
      enabled: true,
      deliveryFeeNgn: 900,
      estimate: "35–50 min",
      minimumOrderNgn: 2500,
      immediateEnabled: true,
      scheduledEnabled: true,
    },
    {
      id: "zone-amala-bodija",
      vendorId: "vendor-amala-skye",
      areaId: "area-bodija",
      name: "Bodija",
      state: "Oyo",
      enabled: true,
      deliveryFeeNgn: 600,
      estimate: "20–35 min",
      minimumOrderNgn: 2000,
      immediateEnabled: true,
      scheduledEnabled: true,
    },
  ]);

  // 6. Seed Dishes
  await db.insert(dishesTable).values([
    {
      id: "dish-jollof-chicken",
      vendorId: "vendor-amaka",
      name: "Smoky Party Jollof & Grilled Chicken",
      slug: "smoky-party-jollof-chicken",
      description: "Firewood party-style jollof rice paired with succulent herb-marinated grilled chicken.",
      category: "Rice",
      priceNgn: 4500,
      imageUrl: "/assets/hero-jollof.png",
      allergens: '["gluten"]',
      isAvailable: true,
    },
    {
      id: "dish-egusi-pounded-yam",
      vendorId: "vendor-mama-k",
      name: "Rich Egusi Soup & Hot Pounded Yam",
      slug: "rich-egusi-soup-pounded-yam",
      description: "Thick hand-ground melon seed soup with stockfish, dry fish, uziza leaves, and fluffy pounded yam.",
      category: "Soups & swallow",
      priceNgn: 5200,
      imageUrl: "/assets/egusi-pounded-yam.png",
      allergens: '["fish"]',
      isAvailable: true,
    },
    {
      id: "dish-artisan-sourdough",
      vendorId: "vendor-butter-crumb",
      name: "Slow-Fermented Artisan Sourdough",
      slug: "artisan-sourdough-bread",
      description: "Crispy crust and airy crumb baked in stone deck ovens using wild yeast starter.",
      category: "Bakery",
      priceNgn: 3800,
      imageUrl: "/assets/bakery-drop.png",
      allergens: '["gluten"]',
      isAvailable: true,
    },
    {
      id: "dish-suya-platter",
      vendorId: "vendor-royal-suya",
      name: "Abuja Special Suya & Kilishi Platter",
      slug: "abuja-special-suya-kilishi",
      description: "Tender flank steak infused with yaji spice rub, charred to perfection with red onions and tomatoes.",
      category: "Grills",
      priceNgn: 6500,
      imageUrl: "/assets/hero-jollof.png",
      allergens: '["peanuts"]',
      isAvailable: true,
    },
    {
      id: "dish-bole-fish",
      vendorId: "vendor-garden-city",
      name: "Port Harcourt Bole & Mackerel Combo",
      slug: "ph-bole-grilled-fish-combo",
      description: "Caramelized roasted yellow plantain, whole charcoal-grilled mackerel, and signature spicy palm sauce.",
      category: "Street food",
      priceNgn: 5500,
      imageUrl: "/assets/egusi-pounded-yam.png",
      allergens: '["fish"]',
      isAvailable: true,
    },
    {
      id: "dish-amala-abula",
      vendorId: "vendor-amala-skye",
      name: "Lafun Amala with Abula & Tender Goat Meat",
      slug: "amala-abula-goat-meat",
      description: "Smooth black yam flour swallow bathed in yellow gbegiri bean broth and dark green ewedu sauce.",
      category: "Traditional swallow",
      priceNgn: 4800,
      imageUrl: "/assets/hero-jollof.png",
      allergens: '[]',
      isAvailable: true,
    },
  ]);

  // 7. Seed Meal Drops (Pre-Order Batches with Countdown Timers)
  await db.insert(mealDropsTable).values([
    {
      id: "drop-amaka-sunday",
      vendorId: "vendor-amaka",
      dishId: "dish-jollof-chicken",
      title: "Sunday Family Jollof Feast Batch",
      batchDate: "Sunday, Nov 29",
      cutoffTime: "Saturday 12:00 PM",
      portionsMax: 40,
      portionsReserved: 28,
      status: "open",
    },
    {
      id: "drop-mama-k-seafood",
      vendorId: "vendor-mama-k",
      dishId: "dish-egusi-pounded-yam",
      title: "Weekend Owerri Fisherman Pot Drop",
      batchDate: "Friday, Nov 27",
      cutoffTime: "Thursday 4:00 PM",
      portionsMax: 25,
      portionsReserved: 19,
      status: "open",
    },
    {
      id: "drop-butter-croissant",
      vendorId: "vendor-butter-crumb",
      dishId: "dish-artisan-sourdough",
      title: "Saturday French Butter Brioche Drop",
      batchDate: "Saturday, Nov 28",
      cutoffTime: "Friday 8:00 PM",
      portionsMax: 30,
      portionsReserved: 30,
      status: "locked", // Sold out test state
    },
  ]);

  // 8. Seed Orders
  await db.insert(ordersTable).values([
    {
      id: "order-mh-20481",
      reference: "MH-20481",
      customerId: "customer-teni",
      vendorId: "vendor-amaka",
      vendorName: "Amaka's Kitchen",
      totalNgn: 12400,
      subtotalNgn: 11300,
      deliveryFeeNgn: 800,
      packagingFeeNgn: 300,
      fulfillmentMode: "delivery",
      fulfillmentStatus: "preparing",
      paymentStatus: "paid",
      deliveryAddress: "12 Community Road, Ikotun, Lagos",
      customerName: "Teni Adebayo",
      customerPhone: "+234 803 123 4567",
      paystackReference: "pstk_live_8392019482",
      items: JSON.stringify([
        { id: "item-1", name: "Smoky Party Jollof & Grilled Chicken", quantity: 2, unitPrice: 4500 },
      ]),
    },
    {
      id: "order-mh-20482",
      reference: "MH-20482",
      customerId: "customer-chidera",
      vendorId: "vendor-mama-k",
      vendorName: "Mama K's Soups",
      totalNgn: 8600,
      subtotalNgn: 7500,
      deliveryFeeNgn: 800,
      packagingFeeNgn: 300,
      fulfillmentMode: "delivery",
      fulfillmentStatus: "received",
      paymentStatus: "paid",
      deliveryAddress: "18 Allen Avenue, Ikeja, Lagos",
      customerName: "Chidera Okafor",
      customerPhone: "+234 802 987 6543",
      paystackReference: "pstk_live_9201928471",
      items: JSON.stringify([
        { id: "item-2", name: "Rich Egusi Soup & Hot Pounded Yam", quantity: 1, unitPrice: 5200 },
      ]),
    },
  ]);

  // 9. Seed Coverage Hubs Directory
  await db.insert(coverageHubsTable).values([
    {
      areaId: "area-ikotun",
      name: "Ikotun",
      state: "Lagos",
      enabled: true,
      activeVendors: 2,
      customerDemand: "high",
      isAutoDiscovered: false,
    },
    {
      areaId: "area-egbe",
      name: "Egbe",
      state: "Lagos",
      enabled: true,
      activeVendors: 1,
      customerDemand: "steady",
      isAutoDiscovered: false,
    },
    {
      areaId: "area-surulere",
      name: "Surulere",
      state: "Lagos",
      enabled: true,
      activeVendors: 1,
      customerDemand: "high",
      isAutoDiscovered: true, // Auto-detected from Butter & Crumb
    },
    {
      areaId: "area-wuse",
      name: "Wuse 2",
      state: "Abuja (FCT)",
      enabled: true,
      activeVendors: 1,
      customerDemand: "high",
      isAutoDiscovered: false,
    },
    {
      areaId: "area-garki",
      name: "Garki",
      state: "Abuja (FCT)",
      enabled: true,
      activeVendors: 1,
      customerDemand: "steady",
      isAutoDiscovered: false,
    },
    {
      areaId: "area-gra-ph",
      name: "Old GRA",
      state: "Rivers",
      enabled: true,
      activeVendors: 1,
      customerDemand: "steady",
      isAutoDiscovered: false,
    },
    {
      areaId: "area-bodija",
      name: "Bodija",
      state: "Oyo",
      enabled: true,
      activeVendors: 1,
      customerDemand: "high",
      isAutoDiscovered: false,
    },
  ]);

  // 10. Seed Audit Logs
  await db.insert(auditLogsTable).values([
    {
      id: "log-1",
      adminName: "Nneka Okafor",
      action: "Approved kitchen storefront",
      target: "Amaka's Kitchen",
      category: "vendor",
    },
    {
      id: "log-2",
      adminName: "Babatunde Raji",
      action: "Added +15m prep buffer",
      target: "Order #MH-20481",
      category: "order",
    },
  ]);

  // 11. Verification Query (Direct evidence that data landed in store)
  const usersCount = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const vendorsCount = await db.select({ count: sql<number>`count(*)` }).from(vendorsTable);
  const dishesCount = await db.select({ count: sql<number>`count(*)` }).from(dishesTable);
  const dropsCount = await db.select({ count: sql<number>`count(*)` }).from(mealDropsTable);
  const ordersCount = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
  const hubsCount = await db.select({ count: sql<number>`count(*)` }).from(coverageHubsTable);

  const verificationSummary = {
    users: Number(usersCount[0]?.count ?? 0),
    vendors: Number(vendorsCount[0]?.count ?? 0),
    dishes: Number(dishesCount[0]?.count ?? 0),
    mealDrops: Number(dropsCount[0]?.count ?? 0),
    orders: Number(ordersCount[0]?.count ?? 0),
    coverageHubs: Number(hubsCount[0]?.count ?? 0),
  };

  console.log("Database seeded and verified successfully:", verificationSummary);
  return verificationSummary;
}

// Allow direct CLI execution
if (process.argv[1]?.includes("seed.ts")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
