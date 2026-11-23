import { describe, expect, it, beforeAll } from "vitest";
import { getDb, getUnderlyingPglite, vendorsTable, dishesTable, mealDropsTable, ordersTable, coverageHubsTable } from "./index";
import { seedDatabase } from "./seed";
import { eq } from "drizzle-orm";

describe("Database & Seed Integration (PostgreSQL via Drizzle)", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("seeded multi-state Nigerian kitchens across Lagos, Abuja, Rivers, and Oyo", async () => {
    const db = getDb();
    const vendors = await db.select().from(vendorsTable);
    expect(vendors.length).toBeGreaterThanOrEqual(6);

    const states = new Set(vendors.map((v: typeof vendorsTable.$inferSelect) => v.state));
    expect(states.has("Lagos")).toBe(true);
    expect(states.has("Abuja (FCT)")).toBe(true);
    expect(states.has("Rivers")).toBe(true);
    expect(states.has("Oyo")).toBe(true);
  });

  it("seeded dual-mode offerings: immediate dishes and scheduled meal drops", async () => {
    const db = getDb();
    const dishes = await db.select().from(dishesTable);
    expect(dishes.length).toBeGreaterThanOrEqual(6);

    const drops = await db.select().from(mealDropsTable);
    expect(drops.length).toBeGreaterThanOrEqual(3);

    // Verify sold out / locked drop status representation
    const lockedDrop = drops.find((d: typeof mealDropsTable.$inferSelect) => d.status === "locked");
    expect(lockedDrop).toBeDefined();
    expect(lockedDrop?.portionsReserved).toBe(lockedDrop?.portionsMax);
  });

  it("seeded orders with references, items, and delivery addresses", async () => {
    const db = getDb();
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.reference, "MH-20481"));
    expect(orders.length).toBe(1);
    expect(orders[0]?.vendorName).toBe("Amaka's Kitchen");
    expect(orders[0]?.paymentStatus).toBe("paid");
  });

  it("seeded coverage hubs directory with auto-detected and standardized hubs", async () => {
    const db = getDb();
    const hubs = await db.select().from(coverageHubsTable);
    expect(hubs.length).toBeGreaterThanOrEqual(7);

    const surulere = hubs.find((h: typeof coverageHubsTable.$inferSelect) => h.name === "Surulere");
    expect(surulere).toBeDefined();
    expect(surulere?.isAutoDiscovered).toBe(true);
  });

  it("exposes underlying PGlite instance in test and local environments", () => {
    const pglite = getUnderlyingPglite();
    expect(pglite).toBeDefined();
    expect(typeof pglite?.query).toBe("function");
  });
});
