import { asAreaId, type CustomerAddress } from "@mealhrs/domain";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AddressesScreen } from "./addresses-screen";

const addresses: readonly CustomerAddress[] = [
  {
    id: "address-home",
    label: "Home",
    line1: "12 Community Road, Ikotun, Lagos",
    areaId: asAreaId("area-ikotun"),
    areaName: "Ikotun",
    isDefault: true,
  },
];

describe("address dialog", () => {
  it("keeps an invalid submission open and focuses its error summary", async () => {
    render(<AddressesScreen initialAddresses={addresses} />);
    fireEvent.click(screen.getByRole("button", { name: "Add address" }));

    const dialog = await screen.findByRole("dialog", { name: "Add a delivery address" });
    expect(dialog).toHaveAttribute("aria-modal", "true");

    fireEvent.click(screen.getByRole("button", { name: "Save address" }));
    const alert = await screen.findByRole("alert");

    expect(dialog).toBeInTheDocument();
    await waitFor(() => expect(alert).toHaveFocus());
  });

  it("restores focus to the exact opener when the dialog closes", async () => {
    render(<AddressesScreen initialAddresses={addresses} />);
    const opener = screen.getByRole("button", { name: "Add address" });
    fireEvent.click(opener);
    await screen.findByRole("dialog", { name: "Add a delivery address" });

    fireEvent.click(screen.getByRole("button", { name: "Close address form" }));
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
