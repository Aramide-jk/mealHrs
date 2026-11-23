import { sql } from "drizzle-orm";
import { getDb } from "./index";

export async function runMigrations() {
  const db = getDb();

  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(128) PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      status TEXT NOT NULL DEFAULT 'active',
      joined_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    `CREATE TABLE IF NOT EXISTS vendors (
      id VARCHAR(128) PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      handle TEXT NOT NULL,
      description TEXT NOT NULL,
      public_area TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'Lagos',
      category TEXT NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT TRUE,
      rating TEXT NOT NULL DEFAULT '4.8',
      review_count INTEGER NOT NULL DEFAULT 0,
      avatar_url TEXT NOT NULL,
      cover_url TEXT NOT NULL,
      accepts_orders BOOLEAN NOT NULL DEFAULT TRUE,
      fulfillment_modes TEXT NOT NULL DEFAULT '["delivery","pickup"]',
      status TEXT NOT NULL DEFAULT 'approved',
      cac_number TEXT,
      bank_name TEXT,
      account_number TEXT,
      account_name TEXT,
      kitchen_address TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    `CREATE TABLE IF NOT EXISTS vendor_delivery_zones (
      id VARCHAR(128) PRIMARY KEY,
      vendor_id VARCHAR(128) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
      area_id VARCHAR(128) NOT NULL,
      name TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'Lagos',
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      delivery_fee_ngn INTEGER NOT NULL DEFAULT 800,
      estimate TEXT NOT NULL DEFAULT '35–50 min',
      minimum_order_ngn INTEGER NOT NULL DEFAULT 0,
      immediate_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      scheduled_enabled BOOLEAN NOT NULL DEFAULT TRUE
    );`,

    `CREATE TABLE IF NOT EXISTS dishes (
      id VARCHAR(128) PRIMARY KEY,
      vendor_id VARCHAR(128) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      price_ngn INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      allergens TEXT NOT NULL DEFAULT '[]',
      option_groups TEXT NOT NULL DEFAULT '[]',
      is_available BOOLEAN NOT NULL DEFAULT TRUE
    );`,

    `CREATE TABLE IF NOT EXISTS meal_drops (
      id VARCHAR(128) PRIMARY KEY,
      vendor_id VARCHAR(128) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
      dish_id VARCHAR(128) NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      batch_date TEXT NOT NULL,
      cutoff_time TEXT NOT NULL,
      portions_max INTEGER NOT NULL,
      portions_reserved INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open'
    );`,

    `CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(128) PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      customer_id VARCHAR(128) NOT NULL REFERENCES users(id),
      vendor_id VARCHAR(128) NOT NULL REFERENCES vendors(id),
      vendor_name TEXT NOT NULL,
      total_ngn INTEGER NOT NULL,
      subtotal_ngn INTEGER NOT NULL,
      delivery_fee_ngn INTEGER NOT NULL DEFAULT 0,
      packaging_fee_ngn INTEGER NOT NULL DEFAULT 300,
      fulfillment_mode TEXT NOT NULL,
      fulfillment_status TEXT NOT NULL DEFAULT 'received',
      payment_status TEXT NOT NULL DEFAULT 'paid',
      delivery_address TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      paystack_reference TEXT,
      items TEXT NOT NULL DEFAULT '[]',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    `CREATE TABLE IF NOT EXISTS coverage_hubs (
      area_id VARCHAR(128) PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      active_vendors INTEGER NOT NULL DEFAULT 1,
      customer_demand TEXT NOT NULL DEFAULT 'high',
      is_auto_discovered BOOLEAN NOT NULL DEFAULT FALSE
    );`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(128) PRIMARY KEY,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      category TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
  ];

  for (const statement of ddlStatements) {
    await db.execute(sql.raw(statement));
  }
}
