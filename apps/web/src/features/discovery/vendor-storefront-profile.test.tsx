import { render, screen } from "@testing-library/react";
import { asAreaId, asVendorId, ngn, type Vendor } from "@mealhrs/domain";
import { describe, expect, it } from "vitest";
import { DeliveryPreviewProvider } from "@/lib/delivery-preview-context";
import { StorefrontPreviewProvider } from "@/lib/storefront-preview-context";
import { CustomerContextProvider } from "@/lib/customer-context";
import { VendorStorefrontProfile } from "./vendor-storefront-profile";

const sampleVendor: Vendor = {
  id: asVendorId("vendor-amaka"),
  slug: "amakas-kitchen",
  name: "Amaka's Kitchen",
  handle: "@amaka",
  description: "Authentic Nigerian party meals cooked fresh to order.",
  publicArea: "Ikotun",
  category: "Traditional",
  verified: true,
  rating: 4.8,
  reviewCount: 38,
  avatarUrl: "/assets/approved-reels-reference.png",
  coverUrl: "/assets/hero-jollof.png",
  acceptsOrders: true,
  fulfillmentModes: ["delivery", "pickup"],
};

const initialEligibility = {
  status: "eligible" as const,
  vendorId: sampleVendor.id,
  areaId: asAreaId("area-ikotun"),
  deliveryFee: ngn(1200),
  estimate: "35–50 min",
};

const sampleDashboard = {
  vendor: sampleVendor,
  onboarding: { status: "ready" as const, completedSteps: ["profile" as const, "fulfillment" as const, "payout_preview" as const, "first_menu" as const], nextStep: "Complete" },
  verification: { status: "approved" as const, accountVerified: true, businessReviewed: true, foodSafetyCertified: true, reviewerNote: "Approved", documents: [] },
  overview: { todaySales: ngn(0), openImmediateOrders: 0, upcomingMealDrops: 0, activePosts: 0, outstandingDeliveries: 0, nextCutoffLabel: "None", recentActivity: [] },
  immediateOrders: [],
  mealDropOrders: [],
  menu: [],
  mealDrops: [],
  posts: [],
  postInsights: [],
  deliveryZones: [
    {
      areaId: asAreaId("area-ikotun"),
      name: "Ikotun",
      enabled: true,
      deliveryFee: ngn(1200),
      estimate: "35–50 min",
      minimumOrder: ngn(3000),
      immediateEnabled: true,
      scheduledEnabled: true,
    },
  ],
  pickupSettings: {
    mode: "both" as const,
    addressNote: "Gate buzzer #4B, call upon arrival.",
    windowNote: "Daily 11:00 AM–7:30 PM",
    pickupAddress: "14 Adeola Odeku St, Victoria Island, Lagos",
    landmark: "Beside Silverbird Galleria",
  },
  operatingSchedule: { weeklyHours: [], maxSimultaneousOrders: 10, pauseImmediate: false, pausePreorders: false, specialClosureNote: "" },
  customers: [],
  teamMembers: [],
  earnings: { periodLabel: "Week", grossSales: ngn(0), platformFees: ngn(0), processingFees: ngn(0), adjustments: ngn(0), refunds: ngn(0), collectedAmount: ngn(0), pendingPayoutAmount: ngn(0), previewBalance: ngn(0), note: "" },
  transactions: [],
  payoutAccount: { bankName: "GTBank", accountNumberMasked: "•••• 4421", accountName: "Amaka Okafor", settlementSchedule: "Daily", verified: true },
  analytics: { periodLabel: "Week", orderCount: 0, immediateOrdersCount: 0, mealDropOrdersCount: 0, repeatCustomerRate: 0, averageOrderValue: ngn(0), acceptanceRate: 1, completionRate: 1, topMeal: "", busyWindow: "", weeklyActivity: [], topAreas: [] },
  storefront: {
    displayName: "Amaka's Kitchen",
    slug: "amakas-kitchen",
    handle: "@amaka",
    category: "Traditional",
    description: "Authentic Nigerian party meals cooked fresh to order.",
    publicArea: "Ikotun",
    orderingHoursLabel: "10 AM–8 PM",
    instagramHandle: "@amaka",
    contactPhone: "+234 803 000 1190",
    accentPreset: "herb" as const,
    acceptsOrders: true,
    coverUrl: "/assets/hero-jollof.png",
    announcementNotice: "Weekend party jollof pre-orders close every Friday at 6:00 PM.",
    announcementEnabled: true,
    specialtyTags: ["100% Homemade", "Halal", "Party Catering"],
    whatsAppPhone: "+2348030001190",
  },
  settings: { orderNotifications: true, mealDropReminders: true, defaultPreparationEstimate: "30 min", supportEmail: "support@example.com" },
  notifications: [],
  contentDrafts: [],
};

describe("VendorStorefrontProfile", () => {
  it("renders live pickup address, landmark, collection window, announcement, and specialty tags", () => {
    render(
      <CustomerContextProvider initialAreaId={asAreaId("area-ikotun")} initialAreas={[{ id: asAreaId("area-ikotun"), name: "Ikotun", state: "Lagos" }]}>
        <StorefrontPreviewProvider dashboard={sampleDashboard}>
          <DeliveryPreviewProvider dashboard={sampleDashboard}>
            <VendorStorefrontProfile
              vendor={sampleVendor}
              eligibility={initialEligibility}
              initialMenu={[]}
              initialDrops={[]}
              now="2026-11-16T12:00:00+01:00"
              location="Ikotun"
            />
          </DeliveryPreviewProvider>
        </StorefrontPreviewProvider>
      </CustomerContextProvider>,
    );

    // Fulfillment mode
    expect(screen.getByText(/Delivery and pickup/i)).toBeInTheDocument();

    // Announcement notice
    expect(screen.getByRole("region", { name: "Kitchen announcement" })).toHaveTextContent(
      "Weekend party jollof pre-orders close every Friday at 6:00 PM.",
    );

    // Specialty chips
    expect(screen.getByText("100% Homemade")).toBeInTheDocument();
    expect(screen.getByText("Halal")).toBeInTheDocument();
    expect(screen.getByText("Party Catering")).toBeInTheDocument();

    // WhatsApp contact button
    expect(screen.getByRole("link", { name: /WhatsApp/i })).toHaveAttribute(
      "href",
      "https://wa.me/2348030001190",
    );

    // Pickup address details in About section
    expect(screen.getByText("14 Adeola Odeku St, Victoria Island, Lagos")).toBeInTheDocument();
    expect(screen.getByText("Beside Silverbird Galleria")).toBeInTheDocument();
    expect(screen.getByText("Daily 11:00 AM–7:30 PM")).toBeInTheDocument();
    expect(screen.getByText(/Gate buzzer #4B/i)).toBeInTheDocument();

    // Delivery coverage details
    expect(screen.getAllByText(/Ikotun/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Min order ₦3,000/i)).toBeInTheDocument();
  });
});
