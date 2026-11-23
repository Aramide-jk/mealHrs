import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CustomerActivityProvider } from "@/lib/customer-activity-context";
import { FollowingContent } from "@/features/discovery/following-content";
import { SavedContent } from "@/features/saved/saved-content";
import type { Vendor } from "@mealhrs/domain";
import type { MealListing } from "@mealhrs/contracts";
import { asDishId, asOfferId, asVendorId, ngn } from "@mealhrs/domain";

const mockVendors: readonly Vendor[] = [
  {
    id: asVendorId("vendor-amaka"),
    slug: "amakas-kitchen",
    name: "Amaka's Kitchen",
    handle: "@amakaskitchen",
    category: "Home Cooking",
    publicArea: "Ikotun",
    avatarUrl: "/assets/avatar-amaka.png",
    coverUrl: "/assets/hero-jollof.png",
    rating: 4.9,
    reviewCount: 324,
    verified: true,
    acceptsOrders: true,
    fulfillmentModes: ["delivery", "pickup"],
    description: "Authentic Nigerian home cooking.",
  },
  {
    id: asVendorId("vendor-bukka"),
    slug: "bukka-express",
    name: "Bukka Express",
    handle: "@bukkaexpress",
    category: "Fast Casual",
    publicArea: "Ikeja",
    avatarUrl: "/assets/avatar-bukka.png",
    coverUrl: "/assets/hero-rice.png",
    rating: 4.6,
    reviewCount: 180,
    verified: false,
    acceptsOrders: true,
    fulfillmentModes: ["delivery"],
    description: "Quick Nigerian lunch plates.",
  },
];

const mockMeals: readonly MealListing[] = [
  {
    dish: {
      id: asDishId("dish-jollof-plate"),
      vendorId: asVendorId("vendor-amaka"),
      name: "Native Jollof Rice",
      category: "Rice",
      description: "Smoky firewood jollof rice",
      imageUrl: "/assets/hero-jollof.png",
      slug: "native-jollof-rice",
      allergens: [],
      optionGroups: [],
    },
    offer: {
      id: asOfferId("offer-jollof-reg"),
      dishId: asDishId("dish-jollof-plate"),
      vendorId: asVendorId("vendor-amaka"),
      orderingMode: "immediate",
      price: ngn(3500),
      availableFulfillment: ["delivery", "pickup"],
      availability: {
        status: "available_now",
        preparationEstimate: "35 mins",
      },
    },
    vendor: mockVendors[0]!,
  },
];

describe("FollowingContent and SavedContent", () => {
  it("renders followed kitchens dynamically and allows toggling unfollow", () => {
    render(
      <CustomerActivityProvider initialFollowedVendorIds={["vendor-amaka"]}>
        <FollowingContent allVendors={mockVendors} />
      </CustomerActivityProvider>,
    );

    expect(screen.getByText("Amaka's Kitchen")).toBeInTheDocument();
    expect(screen.queryByText("Bukka Express")).not.toBeInTheDocument();

    const unfollowBtn = screen.getByRole("button", { name: "Unfollow Amaka's Kitchen" });
    fireEvent.click(unfollowBtn);

    expect(screen.getByText("No followed kitchens yet")).toBeInTheDocument();
  });

  it("renders saved meals and empty states accurately", () => {
    render(
      <CustomerActivityProvider initialSavedMealIds={["dish-jollof-plate"]}>
        <SavedContent allMeals={mockMeals} allVendors={mockVendors} />
      </CustomerActivityProvider>,
    );

    expect(screen.getByRole("tab", { name: /Meals \(1\)/ })).toBeInTheDocument();
    expect(screen.getByText("Native Jollof Rice")).toBeInTheDocument();
  });
});
