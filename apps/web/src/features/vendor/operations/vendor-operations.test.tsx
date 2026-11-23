import { asDishId, asMealDropId, asOfferId, asVendorId, ngn, type MealDrop } from "@mealhrs/domain";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { VendorContentView } from "./vendor-content-view";
import { VendorDropsView } from "./vendor-drops-view";
import { VendorMenuView } from "./vendor-menu-view";

vi.mock("@/lib/menu-preview-context", () => ({
  useMenuPreview: () => {
    const [mealDrops, setMealDrops] = useState<readonly MealDrop[]>([]);
    return {
      items: [{ dish: sampleDish, offer: sampleOffer, dailyLimit: 25, remainingToday: 25, archived: false }],
      mealDrops,
      schedule: { weeklyHours: [], maxSimultaneousOrders: 12, pauseImmediate: false, pausePreorders: false, specialClosureNote: "" },
      updateItem: vi.fn(), addItem: vi.fn(), addMealDrop: (drop: MealDrop) => setMealDrops((current) => [drop, ...current]), archiveItem: vi.fn(), duplicateItem: vi.fn(), updateSchedule: vi.fn(), updateMealDrop: vi.fn(),
      nextIds: () => ({ dishId: asDishId("preview-dish-1"), offerId: asOfferId("preview-offer-1"), mealDropId: asMealDropId("preview-drop-1") }),
    };
  },
}));

const sampleDish = {
  id: asDishId("dish-jollof-chicken"),
  vendorId: asVendorId("vendor-amaka"),
  name: "Jollof Rice & Chicken",
  slug: "jollof-rice-and-chicken",
  description: "Smoky party jollof.",
  category: "Rice",
  imageUrl: "/assets/hero-jollof.png",
  allergens: [],
  optionGroups: [],
};

const sampleOffer = {
  id: asOfferId("offer-jollof-now"),
  dishId: sampleDish.id,
  vendorId: sampleDish.vendorId,
  orderingMode: "immediate" as const,
  price: ngn(3500),
  availability: { status: "available_now" as const, preparationEstimate: "25–35 min" },
  availableFulfillment: ["delivery" as const, "pickup" as const],
};

describe("vendor operations previews", () => {
  it("shows the pre-order schedule only for scheduled batch dishes", () => {
    render(<VendorMenuView menu={[{ dish: sampleDish, offer: sampleOffer }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Add dish" }));

    expect(screen.queryByLabelText("Cutoff date & time")).not.toBeInTheDocument();
    expect(screen.getByText(/Customers order while your kitchen is open/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Ordering model/), { target: { value: "meal_drop" } });

    expect(screen.getByRole("region", { name: "Pre-order schedule" })).toBeInTheDocument();
    expect(screen.getByLabelText("Cutoff date & time")).toBeRequired();
    expect(screen.getByText(/Customers reserve before a cutoff/i)).toBeInTheDocument();
  });

  it("shows validation feedback in Add dish dialog when price is invalid", () => {
    render(<VendorMenuView menu={[{ dish: sampleDish, offer: sampleOffer }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Add dish" }));
    fireEvent.change(screen.getByLabelText("Dish name"), { target: { value: "Moi moi" } });
    fireEvent.change(screen.getByLabelText(/Category/), { target: { value: "Sides" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to preview menu" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/valid price/i);
  });

  it("offers a local multi-photo picker when adding a dish", () => {
    render(<VendorMenuView menu={[{ dish: sampleDish, offer: sampleOffer }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Add dish" }));

    const picker = screen.getByLabelText("Choose dish photos");
    expect(picker).toHaveAttribute("multiple");
    expect(picker).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    expect(screen.getByText(/Files stay only in this browser preview/i)).toBeInTheDocument();
  });

  it("allows adding multiple proteins and extras when creating a dish", () => {
    render(<VendorMenuView menu={[{ dish: sampleDish, offer: sampleOffer }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Add dish" }));
    fireEvent.change(screen.getByLabelText("Dish name"), { target: { value: "Ofada Rice" } });
    fireEvent.change(screen.getByLabelText(/Category/), { target: { value: "Rice meals" } });
    fireEvent.change(screen.getByLabelText("Price (₦)"), { target: { value: "3800" } });

    fireEvent.click(screen.getByRole("button", { name: "Add protein" }));
    fireEvent.change(screen.getByLabelText("Protein choices option 1 name"), { target: { value: "Assorted beef" } });
    fireEvent.change(screen.getByLabelText("Protein choices option 1 extra price"), { target: { value: "800" } });

    fireEvent.click(screen.getByRole("button", { name: "Add extra" }));
    fireEvent.change(screen.getByLabelText("Extras & sides option 1 name"), { target: { value: "Boiled egg" } });
    fireEvent.change(screen.getByLabelText("Extras & sides option 1 extra price"), { target: { value: "400" } });

    fireEvent.click(screen.getByRole("button", { name: "Add to preview menu" }));
    expect(screen.getByRole("status")).toHaveTextContent("Ofada Rice was added to this frontend preview only.");
  });

  it("uses structured fulfillment times and requires a dish for a pre-order batch", () => {
    render(<VendorDropsView mealDrops={[]} menu={[{ dish: sampleDish, offer: sampleOffer }]} now="2026-11-14T10:00:00+01:00" />);
    fireEvent.click(screen.getByRole("button", { name: /Create (pre-order batch|Meal Drop)/i }));

    expect(screen.getByRole("heading", { name: /Create pre-order batch/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Start time")).toHaveAttribute("type", "time");
    expect(screen.getByLabelText("End time")).toHaveAttribute("type", "time");
    expect(screen.getByRole("button", { name: /(Publish pre-order batch|Publish drop preview)/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/(Batch|Drop) name/i), { target: { value: "Sunday lunch" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /Jollof Rice & Chicken/ }));
    fireEvent.click(screen.getByRole("button", { name: /(Publish pre-order batch|Publish drop preview)/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Select at least one menu dish/i);
  });

  it("duplicates an expired drop into an open upcoming Meal Drop", () => {
    const expiredDrop: MealDrop = {
      id: asMealDropId("drop-old"),
      vendorId: asVendorId("vendor-amaka"),
      slug: "old-drop",
      name: "Sunday Party Jollof Meal Drop",
      description: "Batch spread",
      imageUrl: "/assets/hero-jollof.png",
      timezone: "Africa/Lagos",
      cutoffAt: "2026-11-07T18:00:00+01:00",
      fulfillmentDate: "2026-11-08",
      fulfillmentWindow: "1:00–4:00 PM",
      status: "open",
      capacity: 40,
      remainingCapacity: 17,
      items: [{ dishId: sampleDish.id, offerId: sampleOffer.id, quantityLimit: 4 }],
    };

    render(<VendorDropsView mealDrops={[expiredDrop]} now="2026-11-11T10:00:00+01:00" />);
    expect(screen.getByRole("button", { name: "Cutoff passed" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Duplicate" }));
    expect(screen.getByRole("button", { name: "Close pre-orders" })).toBeEnabled();
    expect(screen.getByText(/Sunday Party Jollof Meal Drop \(Next batch\)/)).toBeInTheDocument();
  });

  it("clears published badge when saving draft afterwards in VendorContentView", () => {
    render(
      <VendorContentView
        contentDrafts={[{ id: "draft-1" as never, caption: "Fresh lunch ready", linkedOfferId: sampleOffer.id, status: "draft" }]}
        menu={[{ dish: sampleDish, offer: sampleOffer }]}
        posts={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Publish preview" }));
    expect(screen.getByText("Published in this frontend preview")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    expect(screen.queryByText("Published in this frontend preview")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Draft saved for this frontend preview only.");
  });
});
