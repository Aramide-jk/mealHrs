import { render, screen } from "@testing-library/react";
import { asDishId, asMealDropId, asOfferId, asVendorId, ngn, type Dish, type MenuOffer } from "@mealhrs/domain";
import { describe, expect, it } from "vitest";
import { MealCard } from "./meal-card";

const dish: Dish = { id: asDishId("dish-test"), vendorId: asVendorId("vendor-test"), name: "Test Jollof", slug: "test-jollof", description: "Smoky rice", category: "Rice", imageUrl: "/assets/hero-jollof.png", allergens: [], optionGroups: [] };

describe("MealCard", () => {
  it("routes scheduled offers through their Meal Drop instead of treating the dish as immediate", () => {
    const offer: MenuOffer = { id: asOfferId("offer-test"), dishId: dish.id, vendorId: dish.vendorId, orderingMode: "meal_drop", mealDropId: asMealDropId("drop-test"), price: ngn(3500), availability: { status: "preorder", cutoffAt: "2026-11-07T18:00:00+01:00", fulfillmentWindow: "Sunday" }, availableFulfillment: ["delivery"] };
    render(<MealCard dish={dish} offer={offer} now="2026-11-07T10:00:00+01:00" />);
    expect(screen.getByRole("link", { name: /Test Jollof/i })).toHaveAttribute("href", "/drops/drop-test");
    expect(screen.getByText("Pre-order")).toBeVisible();
  });
  it("labels a preorder after cutoff without removing its detail link", () => {
    const offer: MenuOffer = { id: asOfferId("offer-expired"), dishId: dish.id, vendorId: dish.vendorId, orderingMode: "meal_drop", mealDropId: asMealDropId("drop-expired"), price: ngn(3500), availability: { status: "preorder", cutoffAt: "2026-11-07T18:00:00+01:00", fulfillmentWindow: "Sunday" }, availableFulfillment: ["delivery"] };
    render(<MealCard dish={dish} offer={offer} now="2026-11-07T18:00:01+01:00" />);
    expect(screen.getByText("Cutoff passed")).toBeVisible();
    expect(screen.getByRole("link", { name: /Test Jollof/i })).toHaveAttribute("href", "/drops/drop-expired");
  });
  it("renders a progressive cutoff pill when preorder cutoff is approaching", () => {
    const offer: MenuOffer = { id: asOfferId("offer-soon"), dishId: dish.id, vendorId: dish.vendorId, orderingMode: "meal_drop", mealDropId: asMealDropId("drop-soon"), price: ngn(3500), availability: { status: "preorder", cutoffAt: "2026-11-07T18:00:00+01:00", fulfillmentWindow: "Sunday" }, availableFulfillment: ["delivery"] };
    render(<MealCard dish={dish} offer={offer} now="2026-11-07T16:00:00+01:00" />);
    expect(screen.getByText(/Cutoff in 2h/)).toBeVisible();
  });
});
