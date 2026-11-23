"use client";

import type { AdminDashboardSnapshot } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  Flame,
  Globe,
  Search,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { useAdminActivity } from "@/lib/admin-activity-context";

export function AdminOverviewView({ snapshot }: Readonly<{ snapshot: AdminDashboardSnapshot }>) {
  const {
    activeRole,
    vendors,
    disputes,
    orders,
    moderationItems,
    maintenanceBannerEnabled,
    toggleMaintenanceBanner,
    emergencyKillSwitchEnabled,
  } = useAdminActivity();

  const [searchQuery, setSearchQuery] = useState("");

  const pendingVendors = useMemo(
    () => vendors.filter((v) => v.status === "pending_review"),
    [vendors],
  );
  const openDisputes = useMemo(
    () => disputes.filter((d) => d.status !== "resolved"),
    [disputes],
  );
  const reviewOrders = useMemo(
    () => orders.filter((o) => o.interventionStatus !== "none"),
    [orders],
  );
  const flaggedContent = useMemo(
    () => moderationItems.filter((m) => m.status === "flagged" || m.status === "pending_review"),
    [moderationItems],
  );

  const cards = [
    { label: "Vendor reviews", value: pendingVendors.length, hint: "Compliance decision", icon: BadgeCheck, href: "/admin/vendors" },
    { label: "Open disputes", value: openDisputes.length, hint: "Customer support", icon: ClipboardList, href: "/admin/disputes" },
    { label: "Order reviews", value: reviewOrders.length, hint: "Operational queue", icon: AlertTriangle, href: "/admin/orders" },
    { label: "Flagged content", value: flaggedContent.length, hint: "Moderation queue", icon: FileWarning, href: "/admin/moderation" },
  ] as const;

  // Omni-search matching
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedOrders = orders.filter(
      (o) =>
        o.order.reference.toLowerCase().includes(q) ||
        o.order.vendorName.toLowerCase().includes(q) ||
        o.order.id.toLowerCase().includes(q),
    );
    const matchedVendors = vendors.filter(
      (v) =>
        v.vendor.name.toLowerCase().includes(q) ||
        v.vendor.category.toLowerCase().includes(q) ||
        v.vendor.publicArea.toLowerCase().includes(q),
    );
    const matchedDisputes = disputes.filter(
      (d) =>
        d.topic.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.orderId.toLowerCase().includes(q),
    );

    return { matchedOrders, matchedVendors, matchedDisputes };
  }, [searchQuery, orders, vendors, disputes]);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Platform overview</p>
          <h1>Good afternoon, {snapshot.access.name.split(" ")[0]}</h1>
          <p>
            Logged in with{" "}
            <strong>
              {activeRole === "super_admin"
                ? "Super Admin"
                : activeRole === "operations"
                  ? "Operations"
                  : activeRole === "support"
                    ? "Support"
                    : "Finance"}
            </strong>{" "}
            credentials. Monitor operations, live marketplace activity, and trust queues.
          </p>
        </div>
        <div className="admin-presence">
          <Status tone={emergencyKillSwitchEnabled ? "danger" : "success"}>
            {emergencyKillSwitchEnabled ? "Emergency Pause Active" : "Workspace live"}
          </Status>
          <Button
            size="sm"
            variant={maintenanceBannerEnabled ? "primary" : "secondary"}
            onClick={() => toggleMaintenanceBanner()}
          >
            {maintenanceBannerEnabled ? "Hide global banner" : "Broadcast banner"}
          </Button>
        </div>
      </header>

      {/* Global Banners if Active */}
      {emergencyKillSwitchEnabled ? (
        <aside className="admin-feedback" style={{ borderColor: "#fca5a5", background: "#fef2f2", color: "#991b1b" }} role="alert">
          <Flame size={16} aria-hidden="true" style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
          <strong>Emergency Kill-Switch Engaged:</strong> Customer immediate ordering is temporarily paused platform-wide. Scheduled pre-orders remain active.
        </aside>
      ) : null}

      {maintenanceBannerEnabled ? (
        <aside className="admin-feedback" role="status">
          <CheckCircle2 size={16} aria-hidden="true" style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
          <strong>Global Platform Notice Active:</strong> Maintenance notice is broadcasting live across Customer discovery and Vendor dashboards.
        </aside>
      ) : null}

      {/* Commercial Pulse Ticker */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          padding: 16,
          background: "#fff",
          border: "1px solid var(--color-line)",
          borderRadius: 14,
        }}
        aria-label="Daily commercial pulse"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: 8, borderRadius: 8, background: "#f0fdf4", color: "var(--color-green-700)" }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "var(--color-muted)", display: "block" }}>Today&apos;s GMV</span>
            <strong style={{ fontSize: "1.05rem", fontWeight: 600 }}>{formatMoney(snapshot.finance.grossOrderValue)}</strong>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: 8, borderRadius: 8, background: "#eff6ff", color: "#1d4ed8" }}>
            <Truck size={18} />
          </div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "var(--color-muted)", display: "block" }}>Active Deliveries</span>
            <strong style={{ fontSize: "1.05rem", fontWeight: 600 }}>14 in-transit</strong>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: 8, borderRadius: 8, background: "#faf5ff", color: "#7e22ce" }}>
            <Users size={18} />
          </div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "var(--color-muted)", display: "block" }}>Active Kitchens</span>
            <strong style={{ fontSize: "1.05rem", fontWeight: 600 }}>{vendors.filter((v) => v.status === "approved").length} verified</strong>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: 8, borderRadius: 8, background: "#ecfdf5", color: "var(--color-green-700)" }}>
              <Globe size={18} />
            </div>
            <div>
              <span style={{ fontSize: "0.68rem", color: "var(--color-muted)", display: "block" }}>Nationwide Footprint</span>
              <strong style={{ fontSize: "0.95rem", fontWeight: 600 }}>4 Active States</strong>
            </div>
          </div>
          <Link
            href="/admin/delivery"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--color-green-700)",
              textDecoration: "none",
            }}
          >
            <span>Coverage</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </section>

      {/* Omni Search Bar */}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fff", border: "1px solid var(--color-line)", borderRadius: 12 }}>
          <Search size={18} color="var(--color-muted)" aria-hidden="true" />
          <input
            type="search"
            placeholder="Quick search orders (MH-20481), kitchens (Amaka's), or customers (Teni)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", fontSize: "0.82rem", background: "transparent" }}
            aria-label="Universal admin search"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{ border: "none", background: "transparent", color: "var(--color-muted)", cursor: "pointer", fontSize: "0.75rem" }}
            >
              Clear
            </button>
          ) : null}
        </div>

        {/* Search Results Dropdown */}
        {searchResults ? (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 30,
              marginTop: 6,
              background: "#fff",
              border: "1px solid var(--color-line)",
              borderRadius: 12,
              padding: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              display: "grid",
              gap: 8,
              maxHeight: 320,
              overflowY: "auto",
            }}
          >
            {searchResults.matchedOrders.length === 0 &&
            searchResults.matchedVendors.length === 0 &&
            searchResults.matchedDisputes.length === 0 ? (
              <p style={{ margin: 6, fontSize: "0.78rem", color: "var(--color-muted)" }}>No matches found for &quot;{searchQuery}&quot;.</p>
            ) : null}

            {searchResults.matchedOrders.map((o) => (
              <Link
                key={o.order.id}
                href="/admin/orders"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "#f9faf8",
                  fontSize: "0.75rem",
                  color: "var(--color-ink)",
                }}
              >
                <span>
                  <strong>Order {o.order.reference}</strong> · {o.order.vendorName} ({formatMoney(o.order.total)})
                </span>
                <Status tone="warning">Inspect order</Status>
              </Link>
            ))}

            {searchResults.matchedVendors.map((v) => (
              <Link
                key={v.vendor.id}
                href="/admin/vendors"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "#f9faf8",
                  fontSize: "0.75rem",
                  color: "var(--color-ink)",
                }}
              >
                <span>
                  <strong>Kitchen: {v.vendor.name}</strong> · {v.vendor.publicArea}
                </span>
                <Status tone={v.status === "approved" ? "success" : "warning"}>{v.status}</Status>
              </Link>
            ))}

            {searchResults.matchedDisputes.map((d) => (
              <Link
                key={d.id}
                href="/admin/disputes"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "#f9faf8",
                  fontSize: "0.75rem",
                  color: "var(--color-ink)",
                }}
              >
                <span>
                  <strong>Dispute: {d.topic}</strong> · {d.customerName}
                </span>
                <Status tone="danger">Open dispute</Status>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {/* Main Metric Queues */}
      <section className="admin-metrics" aria-label="Platform queues">
        {cards.map(({ href, hint, icon: Icon, label, value }) => (
          <Link href={href} className="admin-metric" key={label}>
            <span className="admin-metric-icon">
              <Icon aria-hidden="true" />
            </span>
            <p>{label}</p>
            <strong>{value}</strong>
            <small>{hint}</small>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        ))}
      </section>

      {/* Priority Queues Grid */}
      <div className="admin-overview-grid">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <p className="admin-eyebrow">Priority compliance queue</p>
              <h2>Vendor verification</h2>
            </div>
            <Link href="/admin/vendors" aria-label="View vendor reviews">
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          {pendingVendors.length === 0 ? (
            <p className="admin-muted">All kitchen compliance reviews are up to date.</p>
          ) : (
            pendingVendors.map((record) => (
              <div className="admin-record" key={record.vendor.id}>
                <div>
                  <strong>{record.vendor.name}</strong>
                  <span>
                    {record.vendor.category} · {record.vendor.publicArea}
                  </span>
                </div>
                <Status tone="warning">Pending review</Status>
              </div>
            ))
          )}
          <Button asChild block>
            <Link href="/admin/vendors">Review vendor queue ({pendingVendors.length})</Link>
          </Button>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <p className="admin-eyebrow">Platform trust & safety</p>
              <h2>Disputes & refunds</h2>
            </div>
            <Link href="/admin/disputes" aria-label="View disputes">
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          {openDisputes.length === 0 ? (
            <p className="admin-muted">No open customer escalations or pending refunds.</p>
          ) : (
            openDisputes.slice(0, 2).map((dispute) => (
              <div className="admin-record" key={dispute.id}>
                <div>
                  <strong>{dispute.topic}</strong>
                  <span>
                    {dispute.customerName} · Order {dispute.orderId}
                  </span>
                </div>
                <Status tone="warning">{dispute.status.replaceAll("_", " ")}</Status>
              </div>
            ))
          )}
          <p className="admin-muted">Inspect photographic evidence and customer claims before issuing refunds or adjustments.</p>
          <Button asChild variant="secondary" block>
            <Link href="/admin/disputes">Open dispute queue ({openDisputes.length})</Link>
          </Button>
        </section>
      </div>

      <section className="admin-panel admin-quick-panel">
        <div>
          <p className="admin-eyebrow">Operational tools</p>
          <h2>Platform governance</h2>
        </div>
        <div className="admin-quick-actions">
          <Link href="/admin/moderation">
            Moderate media & reels
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/admin/delivery">
            Lagos delivery zones
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/admin/finance">
            Vendor payout ledger
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <p className="admin-preview-note">
          Platform preview mode. All simulated compliance checks, rider dispatches, and bank settlements update live across this workspace.
        </p>
        <Link href="/admin/access" style={{ fontSize: "0.68rem", color: "var(--color-green-700)", fontWeight: 600 }}>
          Switch Admin Persona &rarr;
        </Link>
      </div>
    </div>
  );
}
