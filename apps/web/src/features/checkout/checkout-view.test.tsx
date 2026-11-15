import { fireEvent, render, screen } from "@testing-library/react";
import { asAddressId, asAreaId } from "@mealhrs/domain";
import { describe, expect, it, vi } from "vitest";
import { deliveredOrder, eligible, testAddress, testCart, testVendor } from "@/features/orders/test-fixtures";
import { CheckoutView } from "./checkout-view";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("CheckoutView", () => {
  it("renders repository-backed totals and disables payment for an unsupported area", () => {
    const outside = { status: "outside_area" as const, vendorId: testVendor.id, areaId: asAreaId("area-ikeja"), reason: "Outside delivery area" };
    const workAddress = { ...testAddress, id: asAddressId("address-work"), areaId: outside.areaId, areaName: "Ikeja", isDefault: false };
    render(<CheckoutView activeAreaId={testAddress.areaId} addresses={[testAddress, workAddress]} areas={[{ id: testAddress.areaId, name: "Ikotun" }, { id: outside.areaId, name: "Ikeja" }]} eligibilities={[{ vendorId: testVendor.id, areaId: testAddress.areaId, eligibility: eligible }, { vendorId: testVendor.id, areaId: outside.areaId, eligibility: outside }]} seed={testCart} vendors={[testVendor]} />);
    expect(screen.getAllByText("₦8,000")).toHaveLength(2);
    expect(screen.getByText("₦9,450")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: /Preview address state/ }), { target: { value: outside.areaId } });
    expect(screen.getByRole("button", { name: "Review unavailable meals" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Outside delivery area");
    expect(deliveredOrder.total.amount).toBe(9450);
  });
});
