import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PaymentResultView } from "./payment-result-view";

describe("PaymentResultView", () => {
  afterEach(() => vi.useRealTimers());

  it("moves from a brief processing state to a truthful preview confirmation", () => {
    vi.useFakeTimers();
    render(<PaymentResultView />);

    expect(screen.getByRole("heading", { name: "Processing your payment preview" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1300));
    expect(screen.getByRole("heading", { name: "Payment preview complete" })).toBeInTheDocument();
    expect(screen.getByText(/No payment provider was contacted/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View order confirmation" })).toHaveAttribute("href", "/orders/confirmation/order-mh-20481");
  });

  it("keeps the retry path available only in the explicit failure preview", () => {
    render(<PaymentResultView initialState="failed" />);
    expect(screen.getByRole("heading", { name: "Payment preview was not completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try preview again" })).toBeInTheDocument();
  });
});
