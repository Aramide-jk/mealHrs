import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: varchar("id", { length: 128 }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull().default("customer"), // 'customer' | 'vendor' | 'admin'
  status: text("status").notNull().default("active"), // 'active' | 'restricted'
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const vendorsTable = pgTable("vendors", {
  id: varchar("id", { length: 128 }).primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  handle: text("handle").notNull(),
  description: text("description").notNull(),
  publicArea: text("public_area").notNull(),
  state: text("state").notNull().default("Lagos"),
  category: text("category").notNull(),
  verified: boolean("verified").notNull().default(true),
  rating: text("rating").notNull().default("4.8"),
  reviewCount: integer("review_count").notNull().default(0),
  avatarUrl: text("avatar_url").notNull(),
  coverUrl: text("cover_url").notNull(),
  acceptsOrders: boolean("accepts_orders").notNull().default(true),
  fulfillmentModes: text("fulfillment_modes").notNull().default('["delivery","pickup"]'),
  status: text("status").notNull().default("approved"), // 'approved' | 'pending_review' | 'paused'
  cacNumber: text("cac_number"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  kitchenAddress: text("kitchen_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vendorDeliveryZonesTable = pgTable("vendor_delivery_zones", {
  id: varchar("id", { length: 128 }).primaryKey(),
  vendorId: varchar("vendor_id", { length: 128 }).references(() => vendorsTable.id).notNull(),
  areaId: varchar("area_id", { length: 128 }).notNull(),
  name: text("name").notNull(),
  state: text("state").notNull().default("Lagos"),
  enabled: boolean("enabled").notNull().default(true),
  deliveryFeeNgn: integer("delivery_fee_ngn").notNull().default(800),
  estimate: text("estimate").notNull().default("35–50 min"),
  minimumOrderNgn: integer("minimum_order_ngn").notNull().default(0),
  immediateEnabled: boolean("immediate_enabled").notNull().default(true),
  scheduledEnabled: boolean("scheduled_enabled").notNull().default(true),
});

export const dishesTable = pgTable("dishes", {
  id: varchar("id", { length: 128 }).primaryKey(),
  vendorId: varchar("vendor_id", { length: 128 }).references(() => vendorsTable.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priceNgn: integer("price_ngn").notNull(),
  imageUrl: text("image_url").notNull(),
  allergens: text("allergens").notNull().default("[]"),
  optionGroups: text("option_groups").notNull().default("[]"),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const mealDropsTable = pgTable("meal_drops", {
  id: varchar("id", { length: 128 }).primaryKey(),
  vendorId: varchar("vendor_id", { length: 128 }).references(() => vendorsTable.id).notNull(),
  dishId: varchar("dish_id", { length: 128 }).references(() => dishesTable.id).notNull(),
  title: text("title").notNull(),
  batchDate: text("batch_date").notNull(),
  cutoffTime: text("cutoff_time").notNull(),
  portionsMax: integer("portions_max").notNull(),
  portionsReserved: integer("portions_reserved").notNull().default(0),
  status: text("status").notNull().default("open"), // 'scheduled' | 'open' | 'locked' | 'completed'
});

export const ordersTable = pgTable("orders", {
  id: varchar("id", { length: 128 }).primaryKey(),
  reference: text("reference").notNull().unique(),
  customerId: varchar("customer_id", { length: 128 }).references(() => usersTable.id).notNull(),
  vendorId: varchar("vendor_id", { length: 128 }).references(() => vendorsTable.id).notNull(),
  vendorName: text("vendor_name").notNull(),
  totalNgn: integer("total_ngn").notNull(),
  subtotalNgn: integer("subtotal_ngn").notNull(),
  deliveryFeeNgn: integer("delivery_fee_ngn").notNull().default(0),
  packagingFeeNgn: integer("packaging_fee_ngn").notNull().default(300),
  fulfillmentMode: text("fulfillment_mode").notNull(), // 'delivery' | 'pickup'
  fulfillmentStatus: text("fulfillment_status").notNull().default("received"), // 'received' | 'preparing' | 'ready' | 'dispatched' | 'delivered'
  paymentStatus: text("payment_status").notNull().default("paid"), // 'pending' | 'paid' | 'failed' | 'refunded'
  deliveryAddress: text("delivery_address").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  paystackReference: text("paystack_reference"),
  items: text("items").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coverageHubsTable = pgTable("coverage_hubs", {
  areaId: varchar("area_id", { length: 128 }).primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  activeVendors: integer("active_vendors").notNull().default(1),
  customerDemand: text("customer_demand").notNull().default("high"), // 'high' | 'steady' | 'low'
  isAutoDiscovered: boolean("is_auto_discovered").notNull().default(false),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: varchar("id", { length: 128 }).primaryKey(),
  adminName: text("admin_name").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  category: text("category").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
