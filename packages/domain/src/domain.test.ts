import { describe, expect, it } from "vitest";
import { formatMoney, ngn } from "./money";
import { asAreaId, asVendorId } from "./ids";
import { deriveCoverageHubs, parseVendorLocation, type AdminDeliveryZone, type AdminVendorReview } from "./admin-dashboard";

describe("money", () => {
  it("formats Nigerian naira without fractional noise", () => {
    expect(formatMoney(ngn(3500))).toContain("3,500");
  });
});

describe("coverage hubs dynamic auto-discovery", () => {
  it("parses neighborhood and state from vendor public area", () => {
    const loc1 = parseVendorLocation("Bodija, Ibadan");
    expect(loc1.neighborhood).toBe("Bodija");
    expect(loc1.state).toBe("Oyo");

    const loc2 = parseVendorLocation("Independence Layout, Enugu");
    expect(loc2.neighborhood).toBe("Independence Layout");
    expect(loc2.state).toBe("Enugu");
  });

  it("auto-discovers unlisted locations and updates active kitchen counts", () => {
    const baseZones: AdminDeliveryZone[] = [
      {
        areaId: asAreaId("area-ikotun"),
        name: "Ikotun",
        state: "Lagos",
        enabled: true,
        activeVendors: 1,
        customerDemand: "high",
      },
    ];

    const mockVendors: AdminVendorReview[] = [
      {
        vendor: {
          id: asVendorId("v1"),
          name: "Amaka's Kitchen",
          slug: "amaka",
          handle: "@amaka",
          description: "Party food",
          publicArea: "Ikotun, Lagos",
          category: "Nigerian",
          verified: true,
          rating: 4.8,
          reviewCount: 20,
          avatarUrl: "/a.png",
          coverUrl: "/c.png",
          acceptsOrders: true,
          fulfillmentModes: ["delivery"],
        },
        status: "approved",
        submittedAt: "2026-11-01",
        reviewNote: "Approved",
      },
      {
        vendor: {
          id: asVendorId("v2"),
          name: "Enugu Delights",
          slug: "enugu-delights",
          handle: "@enugu",
          description: "Ofe Nsala & swallow",
          publicArea: "Independence Layout, Enugu",
          category: "Soups",
          verified: true,
          rating: 4.9,
          reviewCount: 15,
          avatarUrl: "/b.png",
          coverUrl: "/d.png",
          acceptsOrders: true,
          fulfillmentModes: ["delivery", "pickup"],
        },
        status: "approved",
        submittedAt: "2026-11-02",
        reviewNote: "Approved",
      },
    ];

    const derived = deriveCoverageHubs(baseZones, mockVendors);

    // Existing Ikotun zone count updated
    const ikotun = derived.find((z) => z.name === "Ikotun");
    expect(ikotun).toBeDefined();
    expect(ikotun?.activeVendors).toBe(1);

    // New hub dynamically discovered for Enugu
    const enuguHub = derived.find((z) => z.name === "Independence Layout");
    expect(enuguHub).toBeDefined();
    expect(enuguHub?.state).toBe("Enugu");
    expect(enuguHub?.isAutoDiscovered).toBe(true);
    expect(enuguHub?.activeVendors).toBe(1);
  });
});
