import { describe, expect, it } from "vitest";
import { asAreaId, asVendorId } from "@mealhrs/domain";
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
});
