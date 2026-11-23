"use client";

import {
  asAreaId,
  formatMoney,
  ngn,
  type AdminAnalyticsPreview,
  type AdminAuditEntry,
  type AdminDeliveryZone,
  type AdminFinancePreview,
  type AdminPlatformSettings,
  type AdminRoleRecord,
} from "@mealhrs/domain";
import {
  Check,
  CheckCircle2,
  Download,
  Flame,
  Globe,
  Landmark,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { cloneElement, isValidElement, useId, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { useAdminActivity, type AdminRoleType } from "@/lib/admin-activity-context";
import styles from "./admin-governance.module.css";

/* -------------------------------------------------------------------------- */
/* 8. REGIONAL COVERAGE & MARKETPLACE DIRECTORY                               */
/* -------------------------------------------------------------------------- */

export function AdminDeliveryView({ zones: initialZones }: Readonly<{ zones: readonly AdminDeliveryZone[] }>) {
  const {
    deliveryZones,
    toggleDeliveryZone,
    addDeliveryZone,
  } = useAdminActivity();

  const [selectedState, setSelectedState] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newState, setNewState] = useState("Lagos");
  const [newHubName, setNewHubName] = useState("");
  const [newHubDemand, setNewHubDemand] = useState<"high" | "steady" | "low">("high");
  const [feedback, setFeedback] = useState("");

  const zones = deliveryZones.length > 0 ? deliveryZones : initialZones;

  // Derive unique states across the country
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    zones.forEach((z) => set.add(z.state ?? "Lagos"));
    return Array.from(set);
  }, [zones]);

  const filteredZones = useMemo(() => {
    return zones.filter((item) => {
      const itemState = item.state ?? "Lagos";
      const matchesState = selectedState === "all" || itemState.toLowerCase() === selectedState.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemState.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesState && matchesSearch;
    });
  }, [zones, selectedState, searchQuery]);

  const totalKitchens = useMemo(
    () => zones.reduce((acc, curr) => acc + curr.activeVendors, 0),
    [zones],
  );

  const handleAddHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName.trim()) return;
    const slug = newHubName.trim().toLowerCase().replaceAll(/\s+/g, "-");
    const newZone: AdminDeliveryZone = {
      areaId: asAreaId(`area-${slug}`),
      name: newHubName.trim(),
      state: newState.trim(),
      enabled: true,
      activeVendors: 1,
      customerDemand: newHubDemand,
    };
    addDeliveryZone(newZone);
    setNewHubName("");
    setShowAddModal(false);
    setFeedback(`New regional hub "${newZone.name}" in ${newZone.state} has been added to the directory.`);
  };

  return (
    <Page
      title="Regional coverage & marketplace directory"
      eyebrow="Platform expansion"
      description="Maintain standardized States and municipal hubs across Nigeria. Any kitchen in any state can sign up, manage their own fulfillment, or offer pickup."
    >
      {/* Top Expansion Summary Cards */}
      <div className={styles.grid}>
        <article className={`card ${styles.metric}`}>
          <span>Active Nigerian States</span>
          <strong>{availableStates.length} States</strong>
          <small>{availableStates.join(", ")}</small>
        </article>

        <article className={`card ${styles.metric}`}>
          <span>Standardized City Hubs</span>
          <strong>{zones.length} Neighborhoods</strong>
          <small>Address & discovery standardization</small>
        </article>

        <article className={`card ${styles.metric}`}>
          <span>Active Kitchens Nationwide</span>
          <strong style={{ color: "var(--color-green-700)" }}>{totalKitchens} Kitchens</strong>
          <small>Independent vendor-fulfilled</small>
        </article>
      </div>

      {/* Philosophy Callout Banner */}
      <aside
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 12,
          fontSize: "0.75rem",
          color: "var(--color-green-700)",
        }}
      >
        <Globe size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Open Marketplace Architecture:</strong> MealHrs empowers independent kitchens in any state to operate professionally. Kitchens define their own delivery radius, prices, and pickup windows in their kitchen settings.
        </span>
      </aside>

      <section className={`card ${styles.section}`}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div>
            <h2>Regional Hubs Directory ({filteredZones.length})</h2>
            <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--color-muted)" }}>
              Standardized locations used by customers to discover local kitchens.
            </p>
          </div>

          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} />
            Add city / neighborhood hub
          </Button>
        </div>

        {/* State Filter Tabs & Search */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            <Button
              size="sm"
              variant={selectedState === "all" ? "primary" : "secondary"}
              onClick={() => setSelectedState("all")}
            >
              All States ({zones.length})
            </Button>
            {availableStates.map((st) => (
              <Button
                key={st}
                size="sm"
                variant={selectedState === st ? "primary" : "secondary"}
                onClick={() => setSelectedState(st)}
              >
                {st}
              </Button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fff", border: "1px solid var(--color-line)", borderRadius: 10, width: "min(280px, 100%)" }}>
            <Search size={15} color="var(--color-muted)" />
            <input
              type="search"
              placeholder="Filter by hub name or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", outline: "none", width: "100%", fontSize: "0.76rem" }}
            />
          </div>
        </div>

        {/* Hubs List */}
        <div className={styles.zoneList}>
          {filteredZones.map((item) => (
            <div className={styles.zone} key={item.areaId}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ padding: 8, borderRadius: 8, background: "#f8f9fa" }}>
                  <MapPin size={16} color="var(--color-muted)" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <strong>{item.name}</strong>
                    {item.isAutoDiscovered ? (
                      <span style={{ fontSize: "0.62rem", padding: "1px 6px", background: "#f0fdf4", color: "var(--color-green-700)", border: "1px solid #bbf7d0", borderRadius: 4, fontWeight: 600 }}>
                        Auto-detected from kitchen
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.62rem", padding: "1px 6px", background: "#f8f9fa", color: "var(--color-muted)", border: "1px solid var(--color-line)", borderRadius: 4, fontWeight: 500 }}>
                        Directory Hub
                      </span>
                    )}
                  </div>
                  <span>
                    State: <strong>{item.state ?? "Lagos"}</strong> · {item.activeVendors} active kitchen{item.activeVendors === 1 ? "" : "s"} · {item.customerDemand} customer demand
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Status tone={item.enabled ? "success" : "neutral"}>
                  {item.enabled ? "Active Directory" : "Paused"}
                </Status>
                <button
                  type="button"
                  className={styles.switch}
                  aria-label={`${item.enabled ? "Pause" : "Enable"} ${item.name} directory hub`}
                  aria-pressed={item.enabled}
                  onClick={() => {
                    toggleDeliveryZone(item.areaId);
                    setFeedback(`${item.name} directory availability updated.`);
                  }}
                >
                  <i />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add City / State Hub Modal */}
      {showAddModal ? (
        <Modal title="Add Regional Hub to Directory" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddHub} style={{ display: "grid", gap: 14 }}>
            <Field label="State / Federal Territory">
              <select
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--color-line)",
                  background: "#fff",
                }}
              >
                <option value="Lagos">Lagos</option>
                <option value="Abuja (FCT)">Abuja (FCT)</option>
                <option value="Rivers">Rivers (Port Harcourt)</option>
                <option value="Oyo">Oyo (Ibadan)</option>
                <option value="Enugu">Enugu</option>
                <option value="Kano">Kano</option>
                <option value="Delta">Delta</option>
                <option value="Ogun">Ogun</option>
                <option value="Edo">Edo (Benin City)</option>
              </select>
            </Field>

            <Field label="Neighborhood / City Hub Name">
              <input
                required
                placeholder="e.g. Wuse 2, Garki, Bodija, Lekki Phase 1, Old GRA"
                value={newHubName}
                onChange={(e) => setNewHubName(e.target.value)}
              />
            </Field>

            <Field label="Customer Demand Signal">
              <select
                value={newHubDemand}
                onChange={(e) => setNewHubDemand(e.target.value as typeof newHubDemand)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--color-line)",
                  background: "#fff",
                }}
              >
                <option value="high">High Demand</option>
                <option value="steady">Steady Demand</option>
                <option value="low">Emerging Area</option>
              </select>
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Save hub to directory</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {feedback ? <p className={styles.feedback} role="status">{feedback}</p> : null}
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* 9. FINANCE VIEW & PAYOUT LEDGER                                            */
/* -------------------------------------------------------------------------- */

export function AdminFinanceView({ finance }: Readonly<{ finance: AdminFinancePreview }>) {
  const {
    vendorPayouts,
    processPayoutBatch,
    payoutBatchStatus,
    commissionRatePercent,
    setCommissionRatePercent,
  } = useAdminActivity();

  const [feedback, setFeedback] = useState("");

  const activePayouts = useMemo(
    () => (vendorPayouts.length > 0 ? vendorPayouts : (finance.vendorPayouts ?? [])),
    [vendorPayouts, finance.vendorPayouts],
  );

  const totalGross = useMemo(
    () => activePayouts.reduce((acc, p) => acc + p.grossAmount.amount, 0),
    [activePayouts],
  );
  const totalFees = useMemo(
    () => activePayouts.reduce((acc, p) => acc + p.feeAmount.amount, 0),
    [activePayouts],
  );
  const totalNet = useMemo(
    () => activePayouts.reduce((acc, p) => acc + p.netPayout.amount, 0),
    [activePayouts],
  );

  const exportCsv = () => {
    const headers = ["Vendor Name", "Orders Count", "Gross GMV (NGN)", "Platform Fee (NGN)", "Net Payout (NGN)", "Bank Name", "NUBAN Account", "Status"];
    const rows = activePayouts.map((p) => [
      `"${p.vendorName}"`,
      p.orderCount,
      p.grossAmount.amount,
      p.feeAmount.amount,
      p.netPayout.amount,
      `"${p.bankName}"`,
      `"${p.accountNumber}"`,
      p.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MealHrs_Payout_Reconciliation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedback("Exported payout ledger reconciliation to CSV.");
  };

  return (
    <Page
      title="Platform finance & settlements"
      eyebrow="Commercial ledger"
      description="Inspect gross marketplace volumes, automated commission deductions, and execute weekly Paystack NUBAN transfers."
    >
      <div className={styles.grid}>
        <Metric label="Gross order value" value={formatMoney(ngn(totalGross || finance.grossOrderValue.amount))} hint={finance.periodLabel} />
        <Metric label="Platform commission" value={formatMoney(ngn(totalFees || finance.platformRevenue.amount))} hint={`${commissionRatePercent}% platform rate`} />
        <Metric label="Pending vendor payouts" value={formatMoney(ngn(totalNet || finance.pendingSettlementPreview.amount))} hint="Net transferable NUBAN" />
      </div>

      {/* Payout Ledger Section */}
      <section className={`card ${styles.section}`}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div>
            <h2>Weekly Vendor Payout Ledger</h2>
            <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--color-muted)" }}>
              Direct bank disbursements to verified Nigerian commercial bank accounts.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button size="sm" variant="secondary" onClick={exportCsv}>
              <Download size={15} />
              Export CSV
            </Button>

            <Button
              size="sm"
              disabled={payoutBatchStatus === "processing" || payoutBatchStatus === "settled"}
              onClick={() => {
                processPayoutBatch();
                setFeedback("Dispatched simulated Paystack NUBAN transfers to all pending kitchens.");
              }}
            >
              {payoutBatchStatus === "processing" ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  Processing Paystack transfers...
                </>
              ) : payoutBatchStatus === "settled" ? (
                <>
                  <CheckCircle2 size={15} />
                  All batches settled
                </>
              ) : (
                <>
                  <Landmark size={15} />
                  Disburse payout batch
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Ledger Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-line)", color: "var(--color-muted)" }}>
                <th style={{ padding: "8px 10px" }}>Kitchen</th>
                <th style={{ padding: "8px 10px" }}>Orders</th>
                <th style={{ padding: "8px 10px" }}>Gross Sales</th>
                <th style={{ padding: "8px 10px" }}>Commission ({commissionRatePercent}%)</th>
                <th style={{ padding: "8px 10px" }}>Net Payable</th>
                <th style={{ padding: "8px 10px" }}>NUBAN Account</th>
                <th style={{ padding: "8px 10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {activePayouts.map((p) => (
                <tr key={p.vendorId} style={{ borderBottom: "1px solid var(--color-line)" }}>
                  <td style={{ padding: "10px", fontWeight: 600 }}>{p.vendorName}</td>
                  <td style={{ padding: "10px" }}>{p.orderCount}</td>
                  <td style={{ padding: "10px" }}>{formatMoney(p.grossAmount)}</td>
                  <td style={{ padding: "10px", color: "var(--color-muted)" }}>{formatMoney(p.feeAmount)}</td>
                  <td style={{ padding: "10px", fontWeight: 600, color: "var(--color-green-700)" }}>{formatMoney(p.netPayout)}</td>
                  <td style={{ padding: "10px" }}>
                    <span>{p.bankName}</span>
                    <small style={{ display: "block", color: "var(--color-muted)" }}>{p.accountNumber}</small>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <Status tone={p.status === "settled" ? "success" : "warning"}>{p.status}</Status>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Commission Rate Configuration */}
      <section className={`card ${styles.section}`}>
        <h2>Platform Commission Settings</h2>
        <p style={{ margin: "0 0 14px", fontSize: "0.74rem", color: "var(--color-muted)" }}>
          Adjust the standard platform take-rate percentage applied to immediate orders and pre-order batches.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 600 }}>Platform Take-Rate:</label>
          <input
            type="range"
            min="5"
            max="15"
            step="1"
            value={commissionRatePercent}
            onChange={(e) => setCommissionRatePercent(Number(e.target.value))}
            style={{ width: 180 }}
          />
          <strong style={{ fontSize: "1rem", color: "var(--color-green-700)" }}>{commissionRatePercent}%</strong>
        </div>
      </section>

      {feedback ? <p className={styles.feedback} role="status">{feedback}</p> : null}
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* 10. PLATFORM ANALYTICS VIEW                                                */
/* -------------------------------------------------------------------------- */

export function AdminAnalyticsView({ analytics }: Readonly<{ analytics: AdminAnalyticsPreview }>) {
  const { analyticsTimeRange, setAnalyticsTimeRange } = useAdminActivity();

  const stats = useMemo(() => {
    if (analyticsTimeRange === "today") {
      return {
        customers: 34,
        vendors: 3,
        orders: 19,
        completion: 98,
        prep: 21,
        transit: 27,
      };
    }
    if (analyticsTimeRange === "30d") {
      return {
        customers: 412,
        vendors: 3,
        orders: 382,
        completion: 95,
        prep: 25,
        transit: 33,
      };
    }
    return {
      customers: analytics.activeCustomers,
      vendors: analytics.activeVendors,
      orders: analytics.completedOrders,
      completion: analytics.completionRate,
      prep: analytics.avgPrepMinutes ?? 23,
      transit: analytics.avgTransitMinutes ?? 31,
    };
  }, [analyticsTimeRange, analytics]);

  const bars = [
    { label: "Mon", value: 46 },
    { label: "Tue", value: 58 },
    { label: "Wed", value: 62 },
    { label: "Thu", value: 74 },
    { label: "Fri", value: 91 },
    { label: "Sat", value: 100 },
    { label: "Sun", value: 82 },
  ];

  return (
    <Page
      title="Platform analytics & insights"
      eyebrow="Performance metrics"
      description="Track platform velocity, order completion punctuality, transit times, and best-selling culinary categories across Lagos."
    >
      {/* Time Range Filter Bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {[
          { id: "today", label: "Today" },
          { id: "7d", label: "Last 7 Days" },
          { id: "30d", label: "Last 30 Days" },
        ].map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={analyticsTimeRange === t.id ? "primary" : "secondary"}
            onClick={() => setAnalyticsTimeRange(t.id as typeof analyticsTimeRange)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className={styles.grid}>
        <Metric label="Active customers" value={String(stats.customers)} hint={analyticsTimeRange.toUpperCase()} />
        <Metric label="Active kitchens" value={String(stats.vendors)} hint="Verified storefronts" />
        <Metric label="Completed orders" value={String(stats.orders)} hint={`${stats.completion}% fulfillment rate`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <article className={`card ${styles.metric}`}>
          <span>Average Kitchen Prep Time</span>
          <strong>{stats.prep} minutes</strong>
          <small>Target: Under 25 minutes</small>
        </article>
        <article className={`card ${styles.metric}`}>
          <span>Average Courier Transit</span>
          <strong>{stats.transit} minutes</strong>
          <small>Lagos Mainland average</small>
        </article>
      </div>

      <div className={styles.analytics}>
        <section className={`card ${styles.section}`}>
          <h2>Order rhythm</h2>
          <p>Relative completion activity across the days of the week.</p>
          <div className={styles.bars}>
            {bars.map((bar) => (
              <div className={styles.barRow} key={bar.label}>
                <span>{bar.label}</span>
                <div>
                  <i style={{ width: `${bar.value}%` }} />
                </div>
                <strong>{bar.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={`card ${styles.section}`}>
          <h2>Top Selling Dishes</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {(analytics.topDishes ?? [
              { name: "Jollof Rice & Chicken", vendorName: "Amaka's Kitchen", ordersCount: 54, grossSales: ngn(237600) },
              { name: "Egusi Soup & Pounded Yam", vendorName: "Mama K's Soups", ordersCount: 38, grossSales: ngn(209000) },
              { name: "Slow-fermented Bread", vendorName: "Butter & Crumb", ordersCount: 19, grossSales: ngn(47500) },
            ]).map((dish, i) => (
              <div key={dish.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#f8f9fa", borderRadius: 8, fontSize: "0.74rem" }}>
                <div>
                  <strong>#{i + 1} {dish.name}</strong>
                  <span style={{ display: "block", color: "var(--color-muted)", fontSize: "0.68rem" }}>{dish.vendorName} · {dish.ordersCount} orders</span>
                </div>
                <strong style={{ color: "var(--color-green-700)" }}>{formatMoney(dish.grossSales)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* 11. ROLES & ACCESS VIEW                                                    */
/* -------------------------------------------------------------------------- */

export function AdminRolesView({ roles: initialRoles }: Readonly<{ roles: readonly AdminRoleRecord[] }>) {
  const { staffRoles, inviteStaffMember, toggleStaffStatus } = useAdminActivity();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRoleType>("operations");
  const [feedback, setFeedback] = useState("");

  const roles = staffRoles.length > 0 ? staffRoles : initialRoles;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    inviteStaffMember({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
    });
    setInviteName("");
    setInviteEmail("");
    setShowInviteModal(false);
    setFeedback(`Sent invitation to ${inviteName.trim()} as ${inviteRole}.`);
  };

  return (
    <Page
      title="Roles, staff & permissions"
      eyebrow="Platform governance"
      description="Manage administrative staff access and view the granular role-based permissions matrix."
    >
      <section className={`card ${styles.section}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2>Authorized Staff Accounts ({roles.length})</h2>
          <Button size="sm" onClick={() => setShowInviteModal(true)}>
            <UserPlus size={15} />
            Invite team member
          </Button>
        </div>

        <div className={styles.roleList}>
          {roles.map((role) => (
            <div className={styles.role} key={role.id}>
              <div>
                <strong>{role.name}</strong>
                <span>
                  {role.email} · {role.role.replaceAll("_", " ").toUpperCase()}
                </span>
              </div>
              <div>
                <span className={styles.pill}>{role.status}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    toggleStaffStatus(role.id);
                    setFeedback(`${role.name}'s status toggled.`);
                  }}
                >
                  {role.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Permissions Matrix */}
      <section className={`card ${styles.section}`}>
        <h2>Granular RBAC Permissions Matrix</h2>
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.74rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-line)", color: "var(--color-muted)" }}>
                <th style={{ padding: "8px 10px" }}>Capability</th>
                <th style={{ padding: "8px 10px" }}>Super Admin</th>
                <th style={{ padding: "8px 10px" }}>Operations</th>
                <th style={{ padding: "8px 10px" }}>Support</th>
                <th style={{ padding: "8px 10px" }}>Finance</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cap: "Approve / Pause Kitchen Storefronts", sa: true, op: true, su: false, fi: false },
                { cap: "Reassign Riders & Extend Prep Buffers", sa: true, op: true, su: true, fi: false },
                { cap: "Dispute Refunds & Vouchers", sa: true, op: false, su: true, fi: false },
                { cap: "Disburse Weekly Payout Batches", sa: true, op: false, su: false, fi: true },
                { cap: "Emergency Ordering Kill-Switch", sa: true, op: true, su: false, fi: false },
                { cap: "Invite & Manage Staff Accounts", sa: true, op: false, su: false, fi: false },
              ].map((row) => (
                <tr key={row.cap} style={{ borderBottom: "1px solid var(--color-line)" }}>
                  <td style={{ padding: "10px", fontWeight: 500 }}>{row.cap}</td>
                  <td style={{ padding: "10px" }}>{row.sa ? <Check size={15} color="var(--color-green-700)" /> : <X size={15} color="#9ca3af" />}</td>
                  <td style={{ padding: "10px" }}>{row.op ? <Check size={15} color="var(--color-green-700)" /> : <X size={15} color="#9ca3af" />}</td>
                  <td style={{ padding: "10px" }}>{row.su ? <Check size={15} color="var(--color-green-700)" /> : <X size={15} color="#9ca3af" />}</td>
                  <td style={{ padding: "10px" }}>{row.fi ? <Check size={15} color="var(--color-green-700)" /> : <X size={15} color="#9ca3af" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invite Modal */}
      {showInviteModal ? (
        <Modal title="Invite Admin Team Member" onClose={() => setShowInviteModal(false)}>
          <form onSubmit={handleInvite} style={{ display: "grid", gap: 14 }}>
            <Field label="Full Name">
              <input
                required
                placeholder="e.g. Fola Davies"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </Field>

            <Field label="Work Email Address">
              <input
                required
                type="email"
                placeholder="fola@mealhrs.example"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </Field>

            <Field label="Platform Role Tier">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as AdminRoleType)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--color-line)",
                  background: "#fff",
                }}
              >
                <option value="operations">Operations Lead</option>
                <option value="support">Customer Support Specialist</option>
                <option value="finance">Finance Officer</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Button type="button" variant="secondary" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Send invitation</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {feedback ? <p className={styles.feedback} role="status">{feedback}</p> : null}
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* 12. AUDIT LOG VIEW                                                         */
/* -------------------------------------------------------------------------- */

export function AdminAuditView({ entries: initialEntries }: Readonly<{ entries: readonly AdminAuditEntry[] }>) {
  const { auditLog } = useAdminActivity();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const list = auditLog.length > 0 ? auditLog : initialEntries;

  const filtered = useMemo(() => {
    return list.filter((item) => {
      const matchesSearch =
        item.action.toLowerCase().includes(search.toLowerCase()) ||
        item.target.toLowerCase().includes(search.toLowerCase()) ||
        item.actor.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [list, search, filterCategory]);

  const exportAuditCsv = () => {
    const headers = ["Timestamp", "Actor", "Action", "Target", "Category"];
    const rows = filtered.map((e) => [
      `"${e.occurredAt}"`,
      `"${e.actor}"`,
      `"${e.action}"`,
      `"${e.target}"`,
      e.category ?? "general",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MealHrs_Audit_Trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Page
      title="Immutable audit trail"
      eyebrow="Security & trace"
      description="Real-time chronological log of all administrator decisions, compliance approvals, rider dispatches, refunds, and configuration mutations."
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fff", border: "1px solid var(--color-line)", borderRadius: 10, width: "min(320px, 100%)" }}>
          <Search size={15} color="var(--color-muted)" />
          <input
            type="search"
            placeholder="Search action, actor, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", fontSize: "0.78rem" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-line)", fontSize: "0.75rem", background: "#fff" }}
          >
            <option value="all">All Categories</option>
            <option value="vendor">Vendor Compliance</option>
            <option value="order">Order Intervention</option>
            <option value="dispute">Disputes & Refunds</option>
            <option value="delivery">Delivery & Surge</option>
            <option value="finance">Finance Payouts</option>
            <option value="settings">Settings & Kill-Switch</option>
            <option value="security">Security & Roles</option>
          </select>

          <Button size="sm" variant="secondary" onClick={exportAuditCsv}>
            <Download size={14} />
            Export Log
          </Button>
        </div>
      </div>

      <section className={`card ${styles.section}`}>
        <ol className={styles.auditList}>
          {filtered.length === 0 ? (
            <p style={{ margin: 12, color: "var(--color-muted)", fontSize: "0.78rem" }}>No audit entries match your filter.</p>
          ) : (
            filtered.map((entry) => (
              <li key={entry.id}>
                <span className={styles.auditDot} aria-hidden="true" />
                <div>
                  <strong>{entry.action}</strong>
                  <p>
                    {entry.actor} · <strong>Target: {entry.target}</strong>
                  </p>
                </div>
                <small>
                  {entry.occurredAt} · {entry.category ?? "security"}
                </small>
              </li>
            ))
          )}
        </ol>
      </section>
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* 13. SETTINGS & EMERGENCY KILL-SWITCH VIEW                                  */
/* -------------------------------------------------------------------------- */

export function AdminSettingsView({ settings }: Readonly<{ settings: AdminPlatformSettings }>) {
  const {
    maintenanceBannerEnabled,
    toggleMaintenanceBanner,
    emergencyKillSwitchEnabled,
    toggleEmergencyKillSwitch,
    emergencyNotice,
    setEmergencyNotice,
    supportEmail,
    setSupportEmail,
    serviceFeeLabel,
    setServiceFeeLabel,
    minOrderValueNgn,
    setMinOrderValueNgn,
  } = useAdminActivity();

  const [saved, setSaved] = useState(false);
  const effectiveSupportEmail = supportEmail || settings.supportEmail;
  const effectiveServiceLabel = serviceFeeLabel || settings.orderServiceFeeLabel;

  return (
    <Page
      title="Platform settings & emergency controls"
      eyebrow="Platform parameters"
      description="Manage marketplace maintenance notifications, customer support emails, service charge labels, and the Emergency Ordering Kill-Switch."
    >
      {/* EMERGENCY PLATFORM KILL-SWITCH CARD */}
      <section
        className="card"
        style={{
          padding: 20,
          border: `1.5px solid ${emergencyKillSwitchEnabled ? "#fca5a5" : "var(--color-line)"}`,
          background: emergencyKillSwitchEnabled ? "#fef2f2" : "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Flame size={18} color={emergencyKillSwitchEnabled ? "#b91c1c" : "var(--color-muted)"} />
              <h2 style={{ margin: 0, fontSize: "1.05rem", color: emergencyKillSwitchEnabled ? "#991b1b" : "var(--color-ink)" }}>
                Emergency Immediate Ordering Kill-Switch
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: "0.75rem", color: emergencyKillSwitchEnabled ? "#7f1d1d" : "var(--color-muted)", maxWidth: 580 }}>
              Instantly halts all immediate customer orders platform-wide during severe Lagos flooding, courier grounding, or network collapse. Scheduled pre-orders (Meal Drops) remain open.
            </p>
          </div>

          <button
            type="button"
            className={styles.switch}
            aria-label="Toggle Emergency Platform Kill-Switch"
            aria-pressed={emergencyKillSwitchEnabled}
            style={{ background: emergencyKillSwitchEnabled ? "#b91c1c" : "#dce2dc" }}
            onClick={() => toggleEmergencyKillSwitch()}
          >
            <i />
          </button>
        </div>

        {emergencyKillSwitchEnabled ? (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #fecaca" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#991b1b", display: "block", marginBottom: 6 }}>
              Live Emergency Banner Text Shown to Customers:
            </label>
            <input
              type="text"
              value={emergencyNotice}
              onChange={(e) => setEmergencyNotice(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #fca5a5",
                background: "#fff",
                fontSize: "0.75rem",
              }}
            />
          </div>
        ) : null}
      </section>

      {/* STANDARD PLATFORM SETTINGS */}
      <section className={`card ${styles.section}`}>
        <h2>Marketplace Parameters</h2>
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }}
        >
          <Toggle
            label="Maintenance banner"
            detail="Broadcasts an informational banner notice to all customers and vendors."
            value={maintenanceBannerEnabled}
            onChange={(val) => toggleMaintenanceBanner(val)}
          />

          <Field label="Customer support email">
            <input
              type="email"
              value={effectiveSupportEmail}
              onChange={(event) => setSupportEmail(event.target.value)}
            />
          </Field>

          <Field label="Customer service fee label">
            <input
              value={effectiveServiceLabel}
              onChange={(event) => setServiceFeeLabel(event.target.value)}
            />
          </Field>

          <Field label="Minimum checkout order value (NGN)">
            <input
              type="number"
              value={minOrderValueNgn}
              onChange={(event) => setMinOrderValueNgn(Number(event.target.value))}
            />
          </Field>

          <div className={styles.formFoot}>
            <Button type="submit">
              <ShieldCheck size={16} />
              Save settings
            </Button>
            {saved ? (
              <p className={styles.saved} role="status">
                <Check size={14} />
                Saved & updated platform configuration
              </p>
            ) : null}
          </div>
        </form>
      </section>
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* REUSABLE HELPERS                                                           */
/* -------------------------------------------------------------------------- */

function Page({
  children,
  description,
  eyebrow,
  title,
}: Readonly<{ children: ReactNode; description: string; eyebrow: string; title: string }>) {
  return (
    <div>
      <header className={styles.head}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <div className="stack-lg">{children}</div>
    </div>
  );
}

function Metric({ hint, label, value }: Readonly<{ hint: string; label: string; value: string }>) {
  return (
    <article className={`card ${styles.metric}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function Field({ children, label }: Readonly<{ children: ReactNode; label: string }>) {
  const id = useId();
  const control = isValidElement<{ id?: string }>(children) ? cloneElement(children, { id }) : children;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {control}
    </div>
  );
}

function Toggle({
  detail,
  label,
  onChange,
  value,
}: Readonly<{ detail: string; label: string; onChange: (value: boolean) => void; value: boolean }>) {
  return (
    <div className={styles.setting}>
      <div>
        <h2>{label}</h2>
        <p>{detail}</p>
      </div>
      <button
        type="button"
        className={styles.switch}
        aria-label={label}
        aria-pressed={value}
        onClick={() => onChange(!value)}
      >
        <i />
      </button>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: Readonly<{ title: string; children: React.ReactNode; onClose: () => void }>) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(18, 25, 20, 0.45)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          width: "min(520px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          border: "1px solid var(--color-line)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: "1.1rem" }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-muted)", padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
