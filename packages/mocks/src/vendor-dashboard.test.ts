import { describe, expect, it } from "vitest";
import type { VendorImmediateOrder, VendorMealDropOrder } from "@mealhrs/domain";
import { mockRepositories } from "./repositories";

describe("vendor dashboard mock adapter", () => {
  it("returns separated immediate and Meal Drop operations with preview-safe earnings", async () => {
    const result = await mockRepositories.vendor.getDashboard();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.immediateOrders.every((order) => order.orderingMode === "immediate")).toBe(true);
    expect(result.data.mealDropOrders.every((order) => order.orderingMode === "meal_drop")).toBe(true);
    const immediate: readonly VendorImmediateOrder[] = result.data.immediateOrders;
    const drops: readonly VendorMealDropOrder[] = result.data.mealDropOrders;
    expect(immediate).toHaveLength(result.data.immediateOrders.length);
    expect(drops).toHaveLength(result.data.mealDropOrders.length);
    expect(result.data.immediateOrders[0]?.operational.paymentLabel).toMatch(/frontend preview/i);
    expect(result.data.immediateOrders[0]?.operational.ageLabel).toMatch(/Placed/i);
    expect(result.data.immediateOrders[0]?.items[0]?.instructions).toBeTruthy();
    expect(result.data.mealDropOrders[0]?.operational.mealDrop?.capacityLabel).toMatch(/reserved/i);
    expect(result.data.mealDropOrders[0]?.operational.mealDrop?.summary).toMatch(/portions/i);
    expect(result.data.earnings.note).toMatch(/Preview only/i);
    expect(result.data.vendor.id).toBe("vendor-amaka");
  });
});
