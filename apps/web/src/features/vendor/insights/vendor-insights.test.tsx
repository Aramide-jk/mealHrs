import { asAreaId, ngn } from "@mealhrs/domain";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VendorWorkspaceProvider } from "../vendor-workspace-context";
import { DeliveryView, EarningsView, AnalyticsView, StorefrontView, SettingsView } from "./vendor-insights";

const sampleZones = [
  {
    areaId: asAreaId("area-ikotun"),
    name: "Ikotun",
    enabled: true,
    deliveryFee: ngn(1200),
    estimate: "30–45 min",
    minimumOrder: ngn(2000),
    immediateEnabled: true,
    scheduledEnabled: true,
  },
  {
    areaId: asAreaId("area-egbe"),
    name: "Egbe",
    enabled: false,
    deliveryFee: ngn(1800),
    estimate: "45–60 min",
    minimumOrder: ngn(3000),
    immediateEnabled: false,
    scheduledEnabled: true,
  },
];

const samplePickup = {
  mode: "both" as const,
  addressNote: "Private street note.",
  windowNote: "Daily 11:00 AM–7:30 PM",
  pickupAddress: "14 Adeola Odeku St, Victoria Island",
  landmark: "Beside Silverbird Galleria",
};

const sampleEarnings = {
  periodLabel: "Last 7 days",
  grossSales: ngn(184500),
  platformFees: ngn(27675),
  processingFees: ngn(2768),
  adjustments: ngn(0),
  refunds: ngn(0),
  collectedAmount: ngn(140000),
  pendingPayoutAmount: ngn(14057),
  previewBalance: ngn(154057),
  note: "Preview calculations reflect 15% standard commission.",
};

const sampleTransactions = [
  {
    id: "txn-1",
    reference: "MH-20481",
    dateLabel: "Today, 12:31 PM",
    gross: ngn(4000),
    commission: ngn(600),
    processingFee: ngn(60),
    net: ngn(3340),
    status: "settled" as const,
  },
  {
    id: "txn-2",
    reference: "MH-19733",
    dateLabel: "Yesterday, 3:15 PM",
    gross: ngn(12000),
    commission: ngn(1800),
    processingFee: ngn(180),
    net: ngn(10020),
    status: "pending_payout" as const,
  },
];

const samplePayoutAccount = {
  bankName: "Access Bank",
  accountNumberMasked: "•••• 4821",
  accountName: "Amaka Okafor Kitchen Ventures",
  settlementSchedule: "Next business day (T+1 preview)",
  verified: true,
};

const sampleAnalytics = {
  periodLabel: "Last 7 days",
  orderCount: 46,
  immediateOrdersCount: 31,
  mealDropOrdersCount: 15,
  repeatCustomerRate: 34,
  averageOrderValue: ngn(4011),
  acceptanceRate: 98,
  completionRate: 96,
  topMeal: "Jollof Rice & Chicken",
  busyWindow: "12:00–2:00 PM",
  weeklyActivity: [
    { label: "Mon", value: 54 },
    { label: "Tue", value: 38 },
    { label: "Wed", value: 70 },
    { label: "Thu", value: 61 },
    { label: "Fri", value: 88 },
    { label: "Sat", value: 100 },
    { label: "Sun", value: 78 },
  ],
  topAreas: [
    { name: "Ikotun", orders: 29 },
    { name: "Egbe", orders: 17 },
  ],
};

const sampleStorefront = {
  displayName: "Amaka's Kitchen",
  slug: "amakas-kitchen",
  handle: "@amakaskitchen.ng",
  category: "Nigerian kitchen",
  description: "Authentic Nigerian party cooking.",
  publicArea: "Ikotun, Lagos",
  orderingHoursLabel: "Mon–Sat 10:00 AM–8:00 PM",
  instagramHandle: "@amakaskitchen.ng",
  contactPhone: "+234 803 000 1190",
  accentPreset: "herb" as const,
  acceptsOrders: true,
  coverUrl: "/assets/hero-jollof.png",
  avatarUrl: "/assets/approved-reels-reference.png",
  announcementNotice: "Weekend party jollof pre-orders close every Friday at 6:00 PM.",
  announcementEnabled: true,
  specialtyTags: ["100% Homemade", "Halal"],
  whatsAppPhone: "+234 803 000 1190",
};

const sampleSettings = {
  orderNotifications: true,
  mealDropReminders: true,
  defaultPreparationEstimate: "25–35 min",
  supportEmail: "support@mealhrs.example",
  autoAcceptOrders: false,
  whatsAppNotifications: true,
  smsNotifications: true,
  emailDigest: true,
};

describe("Vendor Insights Tabs", () => {
  it("DeliveryView: removes a delivery zone and toggles eligibility preview mode", () => {
    render(
      <DeliveryView
        zones={sampleZones}
        pickupSettings={samplePickup}
        availableAreas={[{ id: "area-surulere", name: "Surulere", state: "Lagos" }]}
      />,
    );

    expect(screen.getAllByText("Ikotun").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Egbe").length).toBeGreaterThan(0);

    // Toggle eligibility preview mode
    fireEvent.click(screen.getByRole("button", { name: /Pre-order drop/i }));
    expect(screen.getByText(/customers see delivery at/i)).toBeInTheDocument();

    // Remove Egbe zone
    const removeEgbeBtn = screen.getByRole("button", { name: "Remove Egbe zone" });
    fireEvent.click(removeEgbeBtn);
    expect(screen.queryByRole("button", { name: "Remove Egbe zone" })).not.toBeInTheDocument();
  });

  it("EarningsView: filters transactions and opens transaction details dialog", () => {
    render(
      <EarningsView
        earnings={sampleEarnings}
        transactions={sampleTransactions}
        payoutAccount={samplePayoutAccount}
      />,
    );

    expect(screen.getByText("MH-20481")).toBeInTheDocument();
    expect(screen.getByText("MH-19733")).toBeInTheDocument();

    // Filter to settled
    fireEvent.click(screen.getByRole("tab", { name: /Settled \(1\)/i }));
    expect(screen.getByText("MH-20481")).toBeInTheDocument();
    expect(screen.queryByText("MH-19733")).not.toBeInTheDocument();

    // Click transaction row to open details
    fireEvent.click(screen.getByRole("button", { name: /MH-20481/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Net payout to kitchen")).toBeInTheDocument();
  });

  it("AnalyticsView: switches sub-tabs and displays menu leaders and quality metrics", () => {
    render(<AnalyticsView analytics={sampleAnalytics} />);

    expect(screen.getByText("Order rhythm by day of week")).toBeInTheDocument();

    // Switch to menu leaders tab
    fireEvent.click(screen.getByRole("tab", { name: "Menu leaders" }));
    expect(screen.getByText("Top performing dishes")).toBeInTheDocument();
    expect(screen.getByText("Egusi Soup with Pounded Yam")).toBeInTheDocument();

    // Switch to quality & fulfillment tab
    fireEvent.click(screen.getByRole("tab", { name: "Quality & fulfillment" }));
    expect(screen.getByText("Fulfillment reliability signals")).toBeInTheDocument();
    expect(screen.getByText(/0.8% \(healthy: under 2.0%\)/)).toBeInTheDocument();
  });

  it("StorefrontView: updates specialty tags and reflects live customer preview", () => {
    render(
      <VendorWorkspaceProvider>
        <StorefrontView storefront={sampleStorefront} />
      </VendorWorkspaceProvider>,
    );

    // Initial tags
    expect(screen.getByText("Weekend party jollof pre-orders close every Friday at 6:00 PM.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "100% Homemade ✓" })).toBeInTheDocument();

    // Toggle a new specialty badge
    fireEvent.click(screen.getByRole("button", { name: "Party Catering +" }));
    expect(screen.getByRole("button", { name: "Party Catering ✓" })).toBeInTheDocument();
  });

  it("SettingsView: switches to Payout Bank tab and Availability limits", () => {
    render(
      <VendorWorkspaceProvider>
        <SettingsView
          settings={sampleSettings}
          payoutAccount={samplePayoutAccount}
          teamMembers={[{ id: "tm-1", name: "Amaka Okafor", email: "amaka@example.com", role: "owner", status: "active" }]}
        />
      </VendorWorkspaceProvider>,
    );

    // Initial general tab
    expect(screen.getByText("Immediate order acceptance mode")).toBeInTheDocument();

    // Switch to Payout & settlement bank
    fireEvent.click(screen.getByRole("tab", { name: /Payout & settlement bank/i }));
    expect(screen.getByText("Settlement bank account")).toBeInTheDocument();
    expect(screen.getByText("Access Bank")).toBeInTheDocument();
    expect(screen.getByText("Amaka Okafor Kitchen Ventures")).toBeInTheDocument();

    // Switch to Availability & limits
    fireEvent.click(screen.getByRole("tab", { name: /Availability & limits/i }));
    expect(screen.getByText("Maximum simultaneous immediate orders")).toBeInTheDocument();
    expect(screen.getByText("Emergency / temporary closure notice")).toBeInTheDocument();
  });
});
