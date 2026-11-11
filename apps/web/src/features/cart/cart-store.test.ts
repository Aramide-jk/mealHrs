import { asDishId, asOfferId, asVendorId, ngn } from "@mealhrs/domain";
import { beforeEach, describe, expect, it } from "vitest";
import { addCartItem, useCartStore } from "./cart-store";

describe("persisted cart authority", () => {
  beforeEach(() => useCartStore.getState().clear());

  it("atomically replaces an incompatible vendor and preserves offer choices", () => {
    const vendorId = asVendorId("vendor-mama-k");
    addCartItem({ vendorId, orderingMode: "meal_drop" }, {
      id: "egusi-turkey",
      dishId: asDishId("dish-egusi"),
      offerId: asOfferId("offer-egusi-preorder"),
      name: "Egusi & Pounded Yam",
      imageUrl: "/assets/egusi-pounded-yam.png",
      unitPrice: ngn(4200),
      quantity: 2,
      instructions: "No extra oil",
      selectedOptions: [{ name: "Protein", value: "Turkey", priceDelta: ngn(500) }],
    });
    const cart = useCartStore.getState().cart;
    expect(cart).toMatchObject({ vendorId, orderingMode: "meal_drop" });
    expect(cart?.items[0]).toMatchObject({ quantity: 2, instructions: "No extra oil" });
    expect(cart?.items[0]?.selectedOptions[0]?.value).toBe("Turkey");
  });
});
