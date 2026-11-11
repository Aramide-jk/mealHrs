import { describe, expect, it } from "vitest";
import { testCart } from "@/features/orders/test-fixtures";
import { cartSubtotal, cartTotal } from "./pricing";

describe("cart pricing", () => {
  it("applies option deltas per quantity and discloses the final total", () => {
    expect(cartSubtotal(testCart)).toBe(8000);
    expect(cartTotal(testCart, 1200)).toBe(9450);
  });
});
