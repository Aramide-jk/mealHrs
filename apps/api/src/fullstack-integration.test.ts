import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { buildServer } from "./server";
import { seedDatabase } from "./db/seed";
import type { FastifyInstance } from "fastify";
import { asAreaId, asVendorId } from "@mealhrs/domain";

// Adapter function identical to apps/web/src/lib/http-repositories.ts
function createHttpRepositories(baseUrl: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, "");

  async function fetchApi<T>(path: string, init?: RequestInit) {
    const url = `${normalizedBase}${path.startsWith("/") ? "" : "/"}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      return { ok: false as const, error: { code: "not_found", message: `HTTP ${res.status}` } };
    }
    const data = (await res.json()) as T;
    return { ok: true as const, data };
  }

  return {
    discovery: {
      getFeed: ({ mode, areaId }: { mode: string; areaId: string }) =>
        fetchApi<any>(`/v1/discovery/feed?mode=${mode}&areaId=${areaId}`),
      search: ({ query, areaId }: { query: string; areaId: string }) =>
        fetchApi<any>(`/v1/discovery/search?query=${encodeURIComponent(query)}&areaId=${encodeURIComponent(areaId)}`),
      getSavedPosts: () => fetchApi<any>(`/v1/discovery/saved-posts`),
      getFollowedVendors: () => fetchApi<any>(`/v1/discovery/followed-vendors`),
    },
    catalog: {
      listMeals: () => fetchApi<any>(`/v1/catalog/meals`),
      getVendorBySlug: (slug: string) => fetchApi<any>(`/v1/catalog/vendors/${encodeURIComponent(slug)}`),
      getVendorMenu: (vendorId: string) => fetchApi<any>(`/v1/catalog/vendors/${encodeURIComponent(vendorId)}/menu`),
      getVendorMealDrops: (vendorId: string) => fetchApi<any>(`/v1/catalog/vendors/${encodeURIComponent(vendorId)}/meal-drops`),
    },
    delivery: {
      getAreas: () => fetchApi<any>(`/v1/delivery/areas`),
      checkEligibility: ({ vendorId, areaId }: { vendorId: string; areaId: string }) =>
        fetchApi<any>(`/v1/delivery/eligibility?vendorId=${encodeURIComponent(vendorId)}&areaId=${encodeURIComponent(areaId)}`),
    },
    commerce: {
      getCart: () => fetchApi<any>(`/v1/cart`),
      getOrders: () => fetchApi<any>(`/v1/orders`),
    },
    account: {
      getProfile: () => fetchApi<any>(`/v1/account/profile`),
      getAddresses: () => fetchApi<any>(`/v1/account/addresses`),
    },
    vendor: {
      getDashboard: () => fetchApi<any>(`/v1/vendor/dashboard`),
    },
    admin: {
      getDashboard: () => fetchApi<any>(`/v1/admin/dashboard`),
    },
  };
}

describe("Full-Stack End-to-End Live Integration Verification", () => {
  let app: FastifyInstance;
  let serverUrl: string;

  beforeAll(async () => {
    await seedDatabase();
    app = buildServer();
    // Listen on an ephemeral random OS port (0)
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (typeof address === "object" && address) {
      serverUrl = `http://127.0.0.1:${address.port}`;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it("End-to-End: Web client queries Discovery feed via HTTP and retrieves DB-seeded kitchen reels", async () => {
    const repos = createHttpRepositories(serverUrl);
    const feed = await repos.discovery.getFeed({ mode: "for_you", areaId: "area-ikotun" });

    expect(feed.ok).toBe(true);
    if (feed.ok) {
      expect(feed.data.items.length).toBeGreaterThanOrEqual(1);
      const first = feed.data.items[0];
      expect(first.vendor.name).toBe("Amaka's Kitchen");
      expect(first.vendor.slug).toBe("amakas-kitchen");
      expect(first.dish.name).toContain("Jollof");
    }
  });

  it("End-to-End: Web client checks delivery eligibility across state borders via live API", async () => {
    const repos = createHttpRepositories(serverUrl);

    // Ikotun zone is enabled for Amaka's Kitchen
    const eligibleRes = await repos.delivery.checkEligibility({
      vendorId: "vendor-amaka",
      areaId: "area-ikotun",
    });
    expect(eligibleRes.ok).toBe(true);
    if (eligibleRes.ok) {
      expect(eligibleRes.data.status).toBe("eligible");
      expect(eligibleRes.data.deliveryFee.amount).toBe(800);
    }

    // Ikeja zone is outside area for Amaka's Kitchen
    const outsideRes = await repos.delivery.checkEligibility({
      vendorId: "vendor-amaka",
      areaId: "area-ikeja",
    });
    expect(outsideRes.ok).toBe(true);
    if (outsideRes.ok) {
      expect(outsideRes.data.status).toBe("outside_area");
    }
  });

  it("End-to-End: Web client fetches Super Admin dashboard and validates nationwide hub state", async () => {
    const repos = createHttpRepositories(serverUrl);
    const adminRes = await repos.admin.getDashboard();

    expect(adminRes.ok).toBe(true);
    if (adminRes.ok) {
      expect(adminRes.data.access.name).toBe("Nneka Okafor");
      expect(adminRes.data.access.role).toBe("super_admin");
      expect(adminRes.data.deliveryZones.length).toBeGreaterThanOrEqual(6);
      expect(adminRes.data.vendors.length).toBeGreaterThanOrEqual(6);
      expect(adminRes.data.analytics.gmvToday.amount).toBe(94500);
    }
  });

  it("End-to-End: Web client executes checkout and verifies newly placed order in database", async () => {
    // 1. Post checkout directly to API
    const res = await fetch(`${serverUrl}/v1/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorId: "vendor-amaka",
        vendorName: "Amaka's Kitchen",
        totalNgn: 10400,
        subtotalNgn: 9200,
        deliveryFeeNgn: 900,
        packagingFeeNgn: 300,
        fulfillmentMode: "delivery",
        deliveryAddress: "5 Tombia Street, Old GRA",
        items: [{ name: "Bole & Roasted Fish", quantity: 2, unitPrice: 4600 }],
      }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.order.reference).toMatch(/^MH-\d+/);

    // 2. Query orders via repository adapter
    const repos = createHttpRepositories(serverUrl);
    const ordersRes = await repos.commerce.getOrders();
    expect(ordersRes.ok).toBe(true);
    if (ordersRes.ok) {
      const match = ordersRes.data.find((o: any) => o.reference === data.order.reference);
      expect(match).toBeDefined();
      expect(match.vendorName).toBe("Amaka's Kitchen");
      expect(match.total.amount).toBe(10400);
    }
  });
});
