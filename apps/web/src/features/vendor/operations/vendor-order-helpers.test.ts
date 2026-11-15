import { asDishId, asOfferId, asOrderId, asVendorId, ngn, type VendorOrder } from "@mealhrs/domain";
import { describe, expect, it } from "vitest";
import {
  aggregatePreparationList,
  initialOrderStage,
  nextActionLabel,
  nextStage,
  orderLineTotalAmount,
} from "./vendor-order-helpers";

const sampleOrder: VendorOrder = {
  id: asOrderId("order-1"),
  reference: "MH-9001",
  vendorId: asVendorId("vendor-amaka"),
  vendorName: "Amaka's Kitchen",
  orderingMode: "immediate",
  fulfillmentMode: "delivery",
  items: [
    {
      id: "line-1",
      dishId: asDishId("dish-jollof-chicken"),
      offerId: asOfferId("offer-jollof-now"),
      name: "Jollof Rice & Chicken",
      imageUrl: "/assets/hero-jollof.png",
      unitPrice: ngn(3500),
      quantity: 2,
      selectedOptions: [{ name: "Extra", value: "Fried plantain", priceDelta: ngn(500) }],
      instructions: "Keep pepper on the side",
    },
  ],
  paymentStatus: "paid",
  orderStatus: "preparing",
  fulfillmentStatus: "preparing",
  fulfillmentWindow: "Today, 2:00 PM",
  subtotal: ngn(8000),
  deliveryFee: ngn(1200),
  serviceFee: ngn(250),
  total: ngn(9450),
  createdAt: "2026-11-11T10:00:00+01:00",
  events: [],
  customer: { name: "Teni", phoneMasked: "+234 80••• 5412" },
  operational: {
    ageLabel: "Placed 5 min ago",
    priority: "normal",
    paymentLabel: "Paid — frontend preview",
    fulfillmentDetail: "12 Community Road",
    contactLabel: "Contact customer",
  },
};

describe("vendor order lifecycle & prep helpers", () => {
  it("progresses delivery orders past ready to out_for_delivery and delivered", () => {
    expect(initialOrderStage(sampleOrder)).toBe("preparing");
    expect(nextActionLabel("preparing", "delivery")).toBe("Mark ready");
    expect(nextStage("preparing", "delivery")).toBe("ready");
    expect(nextActionLabel("ready", "delivery")).toBe("Dispatch");
    expect(nextStage("ready", "delivery")).toBe("out_for_delivery");
    expect(nextActionLabel("out_for_delivery", "delivery")).toBe("Mark delivered");
    expect(nextStage("out_for_delivery", "delivery")).toBe("delivered");
  });

  it("progresses pickup orders directly from ready to delivered on collection", () => {
    expect(nextActionLabel("ready", "pickup")).toBe("Mark collected");
    expect(nextStage("ready", "pickup")).toBe("delivered");
  });

  it("computes line total including options and quantity and aggregates prep list", () => {
    expect(orderLineTotalAmount(sampleOrder.items[0]!)).toBe(8000);
    const prep = aggregatePreparationList([sampleOrder], initialOrderStage);
    expect(prep).toEqual([
      {
        dishName: "Jollof Rice & Chicken",
        totalQuantity: 2,
        optionCounts: [{ label: "Extra: Fried plantain", count: 2 }],
        instructions: ["MH-9001: Keep pepper on the side"],
      },
    ]);
  });
});
