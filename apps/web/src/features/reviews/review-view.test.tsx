import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReviewView } from "./review-view";
import { deliveredOrder } from "@/features/orders/test-fixtures";

describe("ReviewView", () => {
  it("keeps publication disabled until every rating and sufficient text are supplied", () => {
    render(<ReviewView order={deliveredOrder} />);
    const submit = screen.getByRole("button", { name: "Publish verified review" });
    expect(submit).toBeDisabled();
    for (const dimension of ["food quality", "portion and value", "fulfillment reliability"]) {
      fireEvent.click(screen.getByRole("button", { name: `5 stars for ${dimension}` }));
    }
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Excellent food and reliable delivery." } });
    expect(submit).toBeEnabled();
  });
});
