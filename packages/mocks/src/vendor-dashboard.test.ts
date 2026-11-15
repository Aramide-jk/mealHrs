import { describe, expect, it } from "vitest";
import type { VendorImmediateOrder, VendorMealDropOrder } from "@mealhrs/domain";
import { mockRepositories } from "./repositories";

describe("vendor dashboard mock adapter", () => {
  it("returns separated immediate and Meal Drop operations with consistent totals and preview-safe data", async () => {
    const result = await mockRepositories.vendor.getDashboard();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.immediateOrders.every((order) => order.orderingMode === "immediate")).toBe(true);
    expect(result.data.mealDropOrders.every((order) => order.orderingMode === "meal_drop")).toBe(true);

    const immediate: readonly VendorImmediateOrder[] = result.data.immediateOrders;
    const drops: readonly VendorMealDropOrder[] = result.data.mealDropOrders;
    expect(immediate).toHaveLength(result.data.immediateOrders.length);
    expect(drops).toHaveLength(result.data.mealDropOrders.length);

    const firstOrder = result.data.immediateOrders[0]!;
    expect(firstOrder.operational.paymentLabel).toMatch(/frontend preview/i);
    expect(firstOrder.operational.ageLabel).toMatch(/Placed/i);
    expect(firstOrder.items[0]?.instructions).toBeTruthy();
    expect(firstOrder.subtotal.amount).toBe(4000);
    expect(firstOrder.total.amount).toBe(5450);

    expect(result.data.mealDropOrders[0]?.operational.mealDrop?.capacityLabel).toMatch(/reserved/i);
    expect(result.data.mealDropOrders[0]?.operational.mealDrop?.summary).toMatch(/portions/i);
    expect(result.data.earnings.note).toMatch(/Preview only/i);
    expect(result.data.earnings.collectedAmount.amount + result.data.earnings.pendingPayoutAmount.amount).toBe(
      result.data.earnings.previewBalance.amount,
    );
    expect(result.data.analytics.weeklyActivity).toHaveLength(7);
    expect(result.data.customers.length).toBeGreaterThan(0);
    expect(result.data.teamMembers.length).toBeGreaterThan(0);
    expect(result.data.notifications.length).toBeGreaterThan(0);
    expect(result.data.verification.accountVerified).toBe(true);
    expect(result.data.vendor.id).toBe("vendor-amaka");
  });
});
