import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { deliveredOrder } from "./test-fixtures";
import { getOrderProgress, OrderDetailView } from "./order-detail-view";

describe("OrderDetailView", () => {
  it("derives a fully completed progress path for delivered orders", () => {
    expect(getOrderProgress(deliveredOrder).every((step) => step.state === "done")).toBe(true);
    render(<OrderDetailView order={deliveredOrder} />);
    expect(screen.getByRole("heading", { name: "Delivered" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review this order" })).toHaveAttribute("href", "/orders/order-delivered/review");
  });
});
