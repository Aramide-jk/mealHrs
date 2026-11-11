import { describe, expect, it, vi } from "vitest";
import { deliveredOrder } from "./test-fixtures";

const { getOrder } = vi.hoisted(() => ({ getOrder: vi.fn() }));
vi.mock("@/lib/repositories", () => ({ repositories: { commerce: { getOrder } } }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));

import ConfirmationPage from "@/app/(customer)/(commerce)/orders/confirmation/[orderId]/page";
import ReviewPage from "@/app/(customer)/(commerce)/orders/[orderId]/review/page";

describe("commerce order routes", () => {
  it("returns not-found behavior for an unknown confirmation", async () => {
    getOrder.mockResolvedValueOnce({ ok: false, error: { code: "not_found", message: "Missing", retryable: false } });
    await expect(ConfirmationPage({ params: Promise.resolve({ orderId: "unknown" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("returns not-found behavior when an order is not review eligible", async () => {
    getOrder.mockResolvedValueOnce({ ok: true, data: { ...deliveredOrder, fulfillmentStatus: "preparing" } });
    await expect(ReviewPage({ params: Promise.resolve({ orderId: "order-delivered" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
