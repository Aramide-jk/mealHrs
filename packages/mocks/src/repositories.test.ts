import { describe, expect, it } from "vitest";
import { asAreaId, asDishId, asMealDropId, asOfferId, asOrderId, asVendorId } from "@mealhrs/domain";
import { mockRepositories } from "./repositories";
import { dishes, mealDrops, offers } from "./data";

describe("delivery mock adapter", () => {
  it("returns an explicit outside-area result instead of hiding the vendor", async () => {
    const result = await mockRepositories.delivery.checkEligibility({
      vendorId: asVendorId("vendor-amaka"),
      areaId: asAreaId("area-ikeja"),
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.status).toBe("outside_area");
  });

  it("returns pickup-only when kitchen only allows pickup", async () => {
    const result = await mockRepositories.delivery.checkEligibility({
      vendorId: asVendorId("vendor-butter-crumb"),
      areaId: asAreaId("area-surulere"),
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.status).toBe("pickup_only");
  });

  it("returns eligible delivery fee for standard area", async () => {
    const result = await mockRepositories.delivery.checkEligibility({
      vendorId: asVendorId("vendor-amaka"),
      areaId: asAreaId("area-ikotun"),
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.status).toBe("eligible");
  });

  it("delivery.getAreas: lists supported Nigerian areas", async () => {
    const result = await mockRepositories.delivery.getAreas();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("catalog mock integrity", () => {
  it("keeps every Meal Drop item within the same vendor and scheduled offer", () => {
    for (const drop of mealDrops) {
      for (const item of drop.items) {
        const dish = dishes.find((candidate) => candidate.id === item.dishId);
        const offer = offers.find((candidate) => candidate.id === item.offerId);
        expect(dish?.vendorId).toBe(drop.vendorId);
        expect(offer?.vendorId).toBe(drop.vendorId);
        expect(offer?.dishId).toBe(item.dishId);
        expect(offer?.orderingMode).toBe("meal_drop");
        if (offer?.orderingMode === "meal_drop") expect(offer.mealDropId).toBe(drop.id);
      }
    }
  });

  it("catalog methods: listMeals, getVendorBySlug, getVendorMenu, getDish, getOffer, getMealDrop", async () => {
    // listMeals
    const meals = await mockRepositories.catalog.listMeals();
    expect(meals.ok).toBe(true);

    // getVendorBySlug
    const vendor = await mockRepositories.catalog.getVendorBySlug("amakas-kitchen");
    expect(vendor.ok).toBe(true);
    const notFoundVendor = await mockRepositories.catalog.getVendorBySlug("unknown-kitchen");
    expect(notFoundVendor.ok).toBe(false);

    // getVendorMenu & mealDrops
    if (vendor.ok) {
      const menu = await mockRepositories.catalog.getVendorMenu(vendor.data.id);
      expect(menu.ok).toBe(true);
      const drops = await mockRepositories.catalog.getVendorMealDrops(vendor.data.id);
      expect(drops.ok).toBe(true);
    }

    // getDish
    const dish = await mockRepositories.catalog.getDish(asDishId("dish-jollof-chicken"));
    expect(dish.ok).toBe(true);
    const unknownDish = await mockRepositories.catalog.getDish(asDishId("unknown-dish"));
    expect(unknownDish.ok).toBe(false);

    // getOffer
    const offer = await mockRepositories.catalog.getOffer(asOfferId("offer-jollof-now"));
    expect(offer.ok).toBe(true);
    const unknownOffer = await mockRepositories.catalog.getOffer(asOfferId("unknown-offer"));
    expect(unknownOffer.ok).toBe(false);

    // getMealDrop
    const drop = await mockRepositories.catalog.getMealDrop(asMealDropId("drop-sunday-jollof"));
    expect(drop.ok).toBe(true);
    const unknownDrop = await mockRepositories.catalog.getMealDrop(asMealDropId("unknown-drop"));
    expect(unknownDrop.ok).toBe(false);
  });
});

describe("discovery, commerce, and account mock adapters", () => {
  it("discovery: getFeed, search, getSavedPosts, getFollowedVendors", async () => {
    const feed = await mockRepositories.discovery.getFeed({
      mode: "near_me",
      areaId: asAreaId("area-ikotun"),
    });
    expect(feed.ok).toBe(true);

    const search = await mockRepositories.discovery.search({
      query: "jollof",
      areaId: asAreaId("area-ikotun"),
    });
    expect(search.ok).toBe(true);

    const saved = await mockRepositories.discovery.getSavedPosts();
    expect(saved.ok).toBe(true);

    const followed = await mockRepositories.discovery.getFollowedVendors();
    expect(followed.ok).toBe(true);
  });

  it("commerce: getCart, getOrders, getOrder", async () => {
    const cart = await mockRepositories.commerce.getCart();
    expect(cart.ok).toBe(true);

    const orders = await mockRepositories.commerce.getOrders();
    expect(orders.ok).toBe(true);
    if (orders.ok && orders.data.length > 0) {
      const order = await mockRepositories.commerce.getOrder(orders.data[0]!.id);
      expect(order.ok).toBe(true);
    }

    const notFoundOrder = await mockRepositories.commerce.getOrder(asOrderId("unknown-order"));
    expect(notFoundOrder.ok).toBe(false);
  });

  it("account, vendor, and admin dashboards", async () => {
    const profile = await mockRepositories.account.getProfile();
    expect(profile.ok).toBe(true);

    const addresses = await mockRepositories.account.getAddresses();
    expect(addresses.ok).toBe(true);

    const vendorDash = await mockRepositories.vendor.getDashboard();
    expect(vendorDash.ok).toBe(true);

    const adminDash = await mockRepositories.admin.getDashboard();
    expect(adminDash.ok).toBe(true);
  });
});
