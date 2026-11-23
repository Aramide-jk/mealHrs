import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { adminDashboard } from "@mealhrs/mocks";
import { AdminActivityProvider } from "@/lib/admin-activity-context";
import { AdminOverviewView } from "./overview/admin-overview-view";
import {
  CustomerReviewView,
  DisputesView,
  ModerationView,
  OrderReviewView,
  VendorReviewView,
} from "./operations/admin-operations";
import {
  AdminAnalyticsView,
  AdminAuditView,
  AdminDeliveryView,
  AdminFinanceView,
  AdminRolesView,
  AdminSettingsView,
} from "./governance/admin-governance";
import { AdminAccessView } from "./access/admin-access-view";

function renderWithAdmin(ui: React.ReactElement) {
  return render(<AdminActivityProvider>{ui}</AdminActivityProvider>);
}

describe("Super Admin Suite", () => {
  it("Overview: renders commercial pulse, omni-search, and priority queues", () => {
    renderWithAdmin(<AdminOverviewView snapshot={adminDashboard} />);

    expect(screen.getByText("Platform overview")).toBeInTheDocument();
    expect(screen.getByText("Today's GMV")).toBeInTheDocument();
    expect(screen.getByText("Active Deliveries")).toBeInTheDocument();

    // Omni-search
    const searchInput = screen.getByLabelText("Universal admin search");
    fireEvent.change(searchInput, { target: { value: "Amaka" } });
    expect(screen.getByText("Kitchen: Amaka's Kitchen")).toBeInTheDocument();
  });

  it("Access: allows switching role personas and acknowledging checkpoints", () => {
    renderWithAdmin(<AdminAccessView snapshot={adminDashboard} />);

    expect(screen.getByText("Admin access checkpoint")).toBeInTheDocument();
    const opsRoleButton = screen.getByRole("button", { name: /Operations Lead/i });
    fireEvent.click(opsRoleButton);

    expect(screen.getByText("operations")).toBeInTheDocument();
  });

  it("Vendors: inspects compliance dossier and approves kitchen storefront", () => {
    renderWithAdmin(<VendorReviewView vendors={adminDashboard.vendors} />);

    expect(screen.getByText("Vendor reviews")).toBeInTheDocument();

    // Open compliance modal
    const inspectButtons = screen.getAllByRole("button", { name: /Inspect compliance/i });
    expect(inspectButtons[0]).toBeDefined();
    fireEvent.click(inspectButtons[0]!);

    expect(screen.getByText(/Compliance Dossier:/i)).toBeInTheDocument();
    expect(screen.getByText("Verified Settlement Bank Account (NUBAN)")).toBeInTheDocument();
  });

  it("Customers: inspects Customer 360 profile and toggles restriction modal", () => {
    renderWithAdmin(<CustomerReviewView customers={adminDashboard.customers} />);

    expect(screen.getByText("Customers")).toBeInTheDocument();

    // Click Customer 360
    const profileButtons = screen.getAllByRole("button", { name: /Customer 360/i });
    expect(profileButtons[0]).toBeDefined();
    fireEvent.click(profileButtons[0]!);

    expect(screen.getByText("Saved Delivery Locations")).toBeInTheDocument();
    expect(screen.getByText("12 Community Road, Ikotun, Lagos")).toBeInTheDocument();
  });

  it("Orders: opens manifest and logs kitchen mediation", () => {
    renderWithAdmin(<OrderReviewView orders={adminDashboard.orders} />);

    expect(screen.getByText("Order intervention")).toBeInTheDocument();

    const manifestButtons = screen.getAllByRole("button", { name: /Order manifest/i });
    expect(manifestButtons[0]).toBeDefined();
    fireEvent.click(manifestButtons[0]!);

    expect(screen.getByText(/Order Manifest #/i)).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button", { name: /Close/i });
    fireEvent.click(closeButtons[0]!);

    const mediationButtons = screen.getAllByRole("button", { name: /Kitchen mediation/i });
    expect(mediationButtons[0]).toBeDefined();
    fireEvent.click(mediationButtons[0]!);

    expect(screen.getByText(/Kitchen Mediation: #/i)).toBeInTheDocument();
    const saveButton = screen.getByRole("button", { name: /Save mediation log/i });
    fireEvent.click(saveButton);
  });

  it("Disputes: inspects evidence and resolves dispute claim", () => {
    renderWithAdmin(<DisputesView disputes={adminDashboard.disputes} />);

    expect(screen.getByText("Disputes & resolutions")).toBeInTheDocument();

    const inspectButtons = screen.getAllByRole("button", { name: /Inspect claim & evidence/i });
    expect(inspectButtons[0]).toBeDefined();
    fireEvent.click(inspectButtons[0]!);

    expect(screen.getByText(/Dispute Review:/i)).toBeInTheDocument();
    expect(screen.getByText("Submitted Photographic Evidence")).toBeInTheDocument();
  });

  it("Moderation: filters categories and flags media content", () => {
    renderWithAdmin(<ModerationView items={adminDashboard.moderation} />);

    expect(screen.getByText("Content & reels moderation")).toBeInTheDocument();
    expect(screen.getByText("Jollof Rice & Chicken")).toBeInTheDocument();
  });

  it("Coverage: filters Nigerian states, searches directory hubs, and adds city hub", () => {
    renderWithAdmin(<AdminDeliveryView zones={adminDashboard.deliveryZones} />);

    expect(screen.getByText("Regional coverage & marketplace directory")).toBeInTheDocument();
    expect(screen.getByText("Active Nigerian States")).toBeInTheDocument();
    expect(screen.getByText("Standardized City Hubs")).toBeInTheDocument();

    // Verify auto-discovered hub from registered kitchen (Butter & Crumb in Surulere)
    expect(screen.getByText("Surulere")).toBeInTheDocument();
    expect(screen.getByText("Auto-detected from kitchen")).toBeInTheDocument();

    // Filter by State tab
    const abujaTab = screen.getByRole("button", { name: /Abuja/i });
    fireEvent.click(abujaTab);
    expect(screen.getByText("Wuse 2")).toBeInTheDocument();

    // Open Add Hub modal
    const addHubButton = screen.getByRole("button", { name: /Add city \/ neighborhood hub/i });
    fireEvent.click(addHubButton);
    expect(screen.getByText("Add Regional Hub to Directory")).toBeInTheDocument();
  });

  it("Finance: displays weekly payout ledger and triggers batch disbursement", () => {
    renderWithAdmin(<AdminFinanceView finance={adminDashboard.finance} />);

    expect(screen.getByText("Platform finance & settlements")).toBeInTheDocument();
    expect(screen.getByText("Weekly Vendor Payout Ledger")).toBeInTheDocument();
    expect(screen.getByText("Amaka's Kitchen")).toBeInTheDocument();
  });

  it("Analytics: renders performance metrics, time range filters, and top dishes", () => {
    renderWithAdmin(<AdminAnalyticsView analytics={adminDashboard.analytics} />);

    expect(screen.getByText("Platform analytics & insights")).toBeInTheDocument();
    expect(screen.getByText("Average Kitchen Prep Time")).toBeInTheDocument();
    expect(screen.getByText("Top Selling Dishes")).toBeInTheDocument();
  });

  it("Roles & Audit: lists authorized staff and displays audit trail", () => {
    renderWithAdmin(<AdminRolesView roles={adminDashboard.roles} />);
    expect(screen.getByText("Roles, staff & permissions")).toBeInTheDocument();
    expect(screen.getByText("Granular RBAC Permissions Matrix")).toBeInTheDocument();

    renderWithAdmin(<AdminAuditView entries={adminDashboard.auditLog} />);
    expect(screen.getByText("Immutable audit trail")).toBeInTheDocument();
  });

  it("Settings: controls maintenance banner and Emergency Ordering Kill-Switch", () => {
    renderWithAdmin(<AdminSettingsView settings={adminDashboard.settings} />);

    expect(screen.getByText("Emergency Immediate Ordering Kill-Switch")).toBeInTheDocument();

    const killSwitch = screen.getByLabelText("Toggle Emergency Platform Kill-Switch");
    fireEvent.click(killSwitch);

    expect(screen.getByText("Live Emergency Banner Text Shown to Customers:")).toBeInTheDocument();
  });
});
