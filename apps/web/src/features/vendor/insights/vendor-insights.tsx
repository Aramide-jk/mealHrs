"use client";

import {
  asAreaId,
  formatMoney,
  ngn,
  type VendorAnalyticsPreview,
  type VendorDashboardSettings,
  type VendorDeliveryZone,
  type VendorEarningsPreview,
  type VendorOperatingSchedule,
  type VendorPayoutAccountPreview,
  type VendorPickupSettings,
  type VendorStorefrontSettings,
  type VendorTeamMember,
  type VendorTeamRole,
  type VendorTransactionRecord,
} from "@mealhrs/domain";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  MapPinned,
  ShieldCheck,
  Store,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { cloneElement, isValidElement, useId, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { useVendorWorkspace } from "../vendor-workspace-context";
import { useDeliveryPreview } from "@/lib/delivery-preview-context";
import styles from "./vendor-insights.module.css";

export function DeliveryView({
  zones,
  pickupSettings,
  availableAreas = [],
}: Readonly<{
  zones: readonly VendorDeliveryZone[];
  pickupSettings?: VendorPickupSettings;
  availableAreas?: readonly { id: string; name: string; state: string }[];
}>) {
  const deliveryPreview = useDeliveryPreview();
  const [fallbackZones, setFallbackZones] = useState(zones);
  const currentZones = deliveryPreview.vendorId ? deliveryPreview.zones : fallbackZones;
  const [area, setArea] = useState<string>(zones[0]?.areaId ?? "");
  const [fallbackPickup, setFallbackPickup] = useState<VendorPickupSettings>(
    pickupSettings ?? {
      mode: "both",
      addressNote: "Shared privately only after an eligible pickup order is confirmed.",
      windowNote: "Daily 11:00 AM–7:30 PM",
    },
  );
  const pickup = deliveryPreview.pickup ?? fallbackPickup;
  const pickupEnabled = pickup.mode !== "delivery";
  const [addOpen, setAddOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<VendorDeliveryZone | null>(null);
  const [feedback, setFeedback] = useState("");
  const [formError, setFormError] = useState("");

  const active = currentZones.find((zone) => zone.areaId === area);
  const saveZone = (zone: VendorDeliveryZone) => deliveryPreview.vendorId ? deliveryPreview.addZone(zone) : setFallbackZones((items) => items.some((item) => item.areaId === zone.areaId) ? items.map((item) => item.areaId === zone.areaId ? zone : item) : [...items, zone]);
  const updateZone = (areaId: VendorDeliveryZone["areaId"], update: (zone: VendorDeliveryZone) => VendorDeliveryZone) => deliveryPreview.vendorId ? deliveryPreview.updateZone(areaId, update) : setFallbackZones((items) => items.map((zone) => zone.areaId === areaId ? update(zone) : zone));
  const savePickup = (next: VendorPickupSettings) => { if (deliveryPreview.vendorId) deliveryPreview.setPickup(next); else setFallbackPickup(next); };

  const handleAddZone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const fee = Number(form.get("fee"));
    const minOrder = Number(form.get("minOrder") ?? 0);
    const estimate = String(form.get("estimate") ?? "35–50 min").trim() || "35–50 min";

    if (name.length < 2 || !Number.isFinite(fee) || fee < 0) {
      setFormError("Enter a valid area name and non-negative delivery fee.");
      return;
    }
    if (form.get("immediate") !== "on" && form.get("scheduled") !== "on") { setFormError("Enable immediate orders, pre-orders, or both for this zone."); return; }

    const existingArea = availableAreas.find((candidate) => candidate.name.toLowerCase() === name.toLowerCase());
    const areaId = asAreaId(
      existingArea?.id ?? `area-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    );

    const newZone: VendorDeliveryZone = {
      areaId,
      name,
      enabled: true,
      deliveryFee: ngn(fee),
      estimate,
      minimumOrder: ngn(Math.max(0, minOrder || 0)),
      immediateEnabled: form.get("immediate") === "on",
      scheduledEnabled: form.get("scheduled") === "on",
    };

    saveZone(newZone);
    setArea(areaId);
    setFormError("");
    setAddOpen(false);
    setFeedback(`${name} added to delivery coverage in this frontend preview.`);
  };

  const handleSaveZoneEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingZone) return;
    const form = new FormData(event.currentTarget);
    const fee = Number(form.get("fee"));
    const minOrder = Number(form.get("minOrder") ?? 0);
    const estimate = String(form.get("estimate") ?? editingZone.estimate).trim() || editingZone.estimate;
    if (!Number.isFinite(fee) || fee < 0) {
      setFormError("Delivery fee must be ₦0 or more.");
      return;
    }
    if (form.get("immediate") !== "on" && form.get("scheduled") !== "on") { setFormError("Enable immediate orders, pre-orders, or both for this zone."); return; }
    updateZone(editingZone.areaId, (item) => ({
              ...item,
              deliveryFee: ngn(fee),
              minimumOrder: ngn(Math.max(0, minOrder || 0)),
              estimate,
              immediateEnabled: form.get("immediate") === "on",
              scheduledEnabled: form.get("scheduled") === "on",
            }));
    setFormError("");
    setFeedback(`${editingZone.name} delivery terms updated in this frontend preview.`);
    setEditingZone(null);
  };

  return (
    <PageHead
      eyebrow="Fulfillment"
      title="Delivery zones"
      description="Choose where the kitchen delivers, set fees, and manage pickup. Changes are local frontend previews."
      action={
        <Button
          size="sm"
          onClick={() => {
            setFormError("");
            setAddOpen(true);
          }}
        >
          <MapPinned aria-hidden="true" size={16} />
          Add zone
        </Button>
      }
    >
      {feedback ? (
        <p className={styles.feedback} role="status">
          {feedback}
        </p>
      ) : null}

      <section className={`card ${styles.section}`}>
        <div className={styles.zoneList}>
          {currentZones.map((zone) => (
            <div className={styles.zone} key={zone.areaId}>
              <div>
                <strong>{zone.name}</strong>
                <span>
                  {formatMoney(zone.deliveryFee)} · {zone.estimate} · Min {formatMoney(zone.minimumOrder)}
                  {zone.immediateEnabled && zone.scheduledEnabled
                    ? " · Immediate & pre-orders"
                    : zone.scheduledEnabled
                      ? " · Pre-orders only"
                      : zone.immediateEnabled
                        ? " · Immediate only"
                        : ""}
                </span>
              </div>
              <span>{zone.enabled ? "Available" : "Paused"}</span>
              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => {
                  setFormError("");
                  setEditingZone(zone);
                }}
              >
                Edit
              </Button>
              <button
                type="button"
                className={styles.switch}
                aria-label={`${zone.enabled ? "Pause" : "Enable"} ${zone.name} delivery`}
                aria-pressed={zone.enabled}
                onClick={() =>
                  updateZone(zone.areaId, (item) => ({ ...item, enabled: !item.enabled }))
                }
              >
                <i />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.preview}>
          <div>
            <strong>Eligibility preview</strong>
            <p>
              {active?.enabled
                ? `${active.name} customers see delivery at ${formatMoney(active.deliveryFee)} (${active.estimate}).`
                : `${active?.name ?? "This area"} is currently unavailable for delivery.`}
            </p>
          </div>
          <select
            aria-label="Preview delivery zone"
            value={area}
            onChange={(event) => setArea(event.target.value)}
          >
            {currentZones.map((zone) => (
              <option key={zone.areaId} value={zone.areaId}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={`card ${styles.section}`}>
        <h2>Fulfillment mode &amp; pickup</h2>
        <p>MealHrs does not assign independent riders. Vendors manage their own delivery and optional pickup.</p>
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <Field label="Fulfillment options">
              <select
                value={pickup.mode}
                onChange={(event) =>
                  savePickup({ ...pickup, mode: event.target.value as VendorPickupSettings["mode"] })
                }
              >
                <option value="both">Delivery and pickup</option>
                <option value="delivery">Delivery only</option>
                <option value="pickup">Pickup only</option>
              </select>
            </Field>
            {pickupEnabled ? <Field label="Regular pickup hours">
              <input
                value={pickup.windowNote}
                onChange={(event) => savePickup({ ...pickup, windowNote: event.target.value })}
                placeholder="e.g. Monday–Saturday · 11:00 AM–7:30 PM"
              />
            </Field> : null}
          </div>
          {pickupEnabled ? <>
            <p className={styles.formHint}>Pre-orders use the fulfilment window set on each individual pre-order batch.</p>
            <Field label="Pickup address privacy policy">
              <input
                value={pickup.addressNote}
                onChange={(event) => savePickup({ ...pickup, addressNote: event.target.value })}
              />
            </Field>
            <div className={styles.formFoot}>
              <Button
                size="sm"
                type="button"
                onClick={() => setFeedback("Fulfillment and pickup rules saved in this frontend preview.")}
              >
                Save pickup settings
              </Button>
            </div>
          </> : <p className={styles.formHint}>Pickup details are hidden from customers while delivery only is selected.</p>}
        </div>
      </section>

      <Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogBackdrop} />
          <Dialog.Content className={styles.dialog} aria-modal="true">
            <div className={styles.dialogHead}>
              <div>
                <p className={styles.eyebrow}>Delivery coverage</p>
                <Dialog.Title>Add delivery zone</Dialog.Title>
                <Dialog.Description>Add a named Lagos/Nigerian area in this local preview.</Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className={styles.dialogClose} type="button" aria-label="Close add zone">
                  <X aria-hidden="true" size={16} />
                </button>
              </Dialog.Close>
            </div>
            <form className={styles.dialogBody} onSubmit={handleAddZone} noValidate>
              {formError ? (
                <p className={styles.errorBanner} role="alert">
                  {formError}
                </p>
              ) : null}
              <Field label="Area name">
                <input name="name" placeholder="e.g. Isolo or Surulere" required />
              </Field>
              <div className={styles.formGrid}>
                <Field label="Delivery fee (₦)">
                  <input name="fee" type="number" min={0} defaultValue={1500} required />
                </Field>
                <Field label="Minimum order (₦)">
                  <input name="minOrder" type="number" min={0} defaultValue={2500} />
                </Field>
              </div>
              <Field label="Estimated delivery window">
                <input name="estimate" defaultValue="40–55 min" />
              </Field>
              <label className="cluster" style={{ fontSize: "0.72rem" }}>
                <input type="checkbox" name="immediate" defaultChecked />
                <span>Allow immediate orders</span>
              </label>
              <label className="cluster" style={{ fontSize: "0.72rem" }}>
                <input type="checkbox" name="scheduled" defaultChecked />
                <span>Allow pre-order deliveries</span>
              </label>
              <Button type="submit" block>
                Add zone preview
              </Button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={Boolean(editingZone)} onOpenChange={(open) => !open && setEditingZone(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogBackdrop} />
          {editingZone ? (
            <Dialog.Content className={styles.dialog} aria-modal="true">
              <div className={styles.dialogHead}>
                <div>
                  <p className={styles.eyebrow}>Edit zone</p>
                  <Dialog.Title>{editingZone.name}</Dialog.Title>
                  <Dialog.Description>Adjust local fee, minimum order, and fulfillment rules.</Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className={styles.dialogClose} type="button" aria-label="Close edit zone">
                    <X aria-hidden="true" size={16} />
                  </button>
                </Dialog.Close>
              </div>
              <form className={styles.dialogBody} onSubmit={handleSaveZoneEdit} noValidate>
                {formError ? (
                  <p className={styles.errorBanner} role="alert">
                    {formError}
                  </p>
                ) : null}
                <div className={styles.formGrid}>
                  <Field label="Delivery fee (₦)">
                    <input name="fee" type="number" min={0} defaultValue={editingZone.deliveryFee.amount} required />
                  </Field>
                  <Field label="Minimum order (₦)">
                    <input name="minOrder" type="number" min={0} defaultValue={editingZone.minimumOrder.amount} />
                  </Field>
                </div>
                <Field label="Estimated delivery window">
                  <input name="estimate" defaultValue={editingZone.estimate} />
                </Field>
                <label className="cluster" style={{ fontSize: "0.72rem" }}>
                  <input type="checkbox" name="immediate" defaultChecked={editingZone.immediateEnabled} />
                  <span>Allow immediate orders</span>
                </label>
                <label className="cluster" style={{ fontSize: "0.72rem" }}>
                  <input type="checkbox" name="scheduled" defaultChecked={editingZone.scheduledEnabled} />
                  <span>Allow pre-order deliveries</span>
                </label>
                <Button type="submit" block>
                  Save zone changes
                </Button>
              </form>
            </Dialog.Content>
          ) : null}
        </Dialog.Portal>
      </Dialog.Root>
    </PageHead>
  );
}

export function EarningsView({
  earnings,
  transactions = [],
  payoutAccount,
}: Readonly<{
  earnings: VendorEarningsPreview;
  transactions?: readonly VendorTransactionRecord[];
  payoutAccount?: VendorPayoutAccountPreview;
}>) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [statementMessage, setStatementMessage] = useState("");
  const multiplier = period === "month" ? 4 : 1;

  return (
    <PageHead
      eyebrow="Financial preview"
      title="Earnings"
      description={`${period === "week" ? earnings.periodLabel : "This month (scaled preview)"}. These figures are illustrative and no payout transfer is connected.`}
      action={
        <div className="cluster">
          <select
            aria-label="Earnings period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as "week" | "month")}
            style={{
              border: "1px solid var(--color-line)",
              borderRadius: 9,
              padding: "7px 10px",
              fontSize: "0.72rem",
              background: "var(--color-surface)",
            }}
          >
            <option value="week">This week</option>
            <option value="month">Last 30 days</option>
          </select>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() =>
              setStatementMessage(
                "Statement download is a frontend preview only. No CSV or accounting file was generated.",
              )
            }
          >
            <Download aria-hidden="true" size={15} />
            Statement
          </Button>
        </div>
      }
    >
      {statementMessage ? (
        <p className={styles.feedback} role="status">
          {statementMessage}
        </p>
      ) : null}

      <div className={styles.grid}>
        <Metric
          label="Gross sales"
          value={formatMoney(ngn(earnings.grossSales.amount * multiplier))}
          detail={period === "week" ? earnings.periodLabel : "Last 30 days (preview)"}
        />
        <Metric
          label="Settled / collected"
          value={formatMoney(ngn(earnings.collectedAmount.amount * multiplier))}
          detail="Completed preview settlements"
        />
        <Metric
          label="Pending payout"
          value={formatMoney(ngn(earnings.pendingPayoutAmount.amount * multiplier))}
          detail="Not available to withdraw"
        />
      </div>

      <section className={`card ${styles.section}`}>
        <h2>How this preview is calculated</h2>
        <div className={styles.money}>
          <div>
            <span>Gross sales</span>
            <strong>{formatMoney(ngn(earnings.grossSales.amount * multiplier))}</strong>
          </div>
          <div>
            <span>Platform fees</span>
            <strong>−{formatMoney(ngn(earnings.platformFees.amount * multiplier))}</strong>
          </div>
          <div>
            <span>Payment processing charges</span>
            <strong>−{formatMoney(ngn(earnings.processingFees.amount * multiplier))}</strong>
          </div>
          <div>
            <span>Adjustments</span>
            <strong>{formatMoney(ngn(earnings.adjustments.amount * multiplier))}</strong>
          </div>
          <div>
            <span>Refunds</span>
            <strong>−{formatMoney(ngn(earnings.refunds.amount * multiplier))}</strong>
          </div>
          <div className={styles.total}>
            <span>Net preview balance</span>
            <strong>{formatMoney(ngn(earnings.previewBalance.amount * multiplier))}</strong>
          </div>
        </div>
        <div className={styles.notice}>{earnings.note}</div>
      </section>

      {payoutAccount ? (
        <section className={`card ${styles.section}`}>
          <div className="split">
            <div>
              <h2>Payout account preview</h2>
              <p className="vendor-muted">
                {payoutAccount.bankName} · {payoutAccount.accountNumberMasked} · {payoutAccount.accountName}
              </p>
              <p className="vendor-muted" style={{ marginTop: 4 }}>
                Schedule: {payoutAccount.settlementSchedule}
              </p>
            </div>
            <div className="stack" style={{ justifyItems: "end" }}>
              <Status tone={payoutAccount.verified ? "success" : "warning"}>
                {payoutAccount.verified ? "Verified preview" : "Verification required"}
              </Status>
              <Button asChild size="sm" variant="secondary">
                <Link href="/vendor/verification">Manage verification</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {transactions.length ? (
        <section className={`card ${styles.section}`}>
          <h2>Recent transactions</h2>
          <p>Order-level breakdown of gross value, commission, processing fees, and settlement state.</p>
          <div className={styles.ledger}>
            {transactions.map((txn) => (
              <article className={styles.ledgerRow} key={txn.id}>
                <div>
                  <strong>{txn.reference}</strong>
                  <small>{txn.dateLabel}</small>
                </div>
                <div>
                  <small>Gross</small>
                  <strong>{formatMoney(txn.gross)}</strong>
                </div>
                <div>
                  <small>Fees</small>
                  <strong>−{formatMoney(ngn(txn.commission.amount + txn.processingFee.amount))}</strong>
                </div>
                <div>
                  <Status tone={txn.status === "settled" ? "success" : "warning"}>
                    {txn.status === "settled" ? "Settled" : "Pending payout"}
                  </Status>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </PageHead>
  );
}

export function AnalyticsView({ analytics }: Readonly<{ analytics: VendorAnalyticsPreview }>) {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const factor = range === "30d" ? 4 : 1;

  return (
    <PageHead
      eyebrow="Performance preview"
      title="Analytics"
      description={`${range === "7d" ? analytics.periodLabel : "Last 30 days (scaled preview)"}. Trend visuals use seeded frontend data.`}
      action={
        <select
          aria-label="Analytics range"
          value={range}
          onChange={(event) => setRange(event.target.value as "7d" | "30d")}
          style={{
            border: "1px solid var(--color-line)",
            borderRadius: 9,
            padding: "7px 10px",
            fontSize: "0.72rem",
            background: "var(--color-surface)",
          }}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      }
    >
      <div className={styles.grid}>
        <Metric
          label="Orders"
          value={String(analytics.orderCount * factor)}
          detail={`${analytics.immediateOrdersCount * factor} immediate · ${analytics.mealDropOrdersCount * factor} drop`}
        />
        <Metric
          label="Average order"
          value={formatMoney(analytics.averageOrderValue)}
          detail="Across paid previews"
        />
        <Metric
          label="Repeat customers"
          value={`${analytics.repeatCustomerRate}%`}
          detail={`${analytics.acceptanceRate}% accepted · ${analytics.completionRate}% completed`}
        />
      </div>

      <div className={styles.analytics}>
        <section className={`card ${styles.section}`}>
          <h2>Order rhythm</h2>
          <p>Relative order activity across the week.</p>
          <div className={styles.bars}>
            {analytics.weeklyActivity.map((bar) => (
              <div className={styles.barRow} key={bar.label}>
                <span>{bar.label}</span>
                <div className={styles.bar}>
                  <i style={{ width: `${bar.value}%` }} />
                </div>
                <strong>{bar.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={`card ${styles.section}`}>
          <h2>What is working</h2>
          <div className={styles.facts}>
            <Fact label="Top meal" value={analytics.topMeal} />
            <Fact label="Busiest window" value={analytics.busyWindow} />
            <Fact
              label="Top delivery areas"
              value={analytics.topAreas.map((area) => `${area.name} (${area.orders * factor})`).join(" · ")}
            />
            <Fact label="Fulfillment reliability" value={`${analytics.completionRate}% completed on schedule`} />
          </div>
        </section>
      </div>
    </PageHead>
  );
}

export function StorefrontView({ storefront }: Readonly<{ storefront: VendorStorefrontSettings }>) {
  const { updateStorefrontMeta } = useVendorWorkspace();
  const [form, setForm] = useState(storefront);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const updateField = <K extends keyof VendorStorefrontSettings>(key: K, value: VendorStorefrontSettings[K]) => {
    setSaved(false);
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.displayName.trim().length < 2 || form.slug.trim().length < 2) {
      setError("Kitchen name and storefront URL slug are required.");
      return;
    }
    updateStorefrontMeta({
      displayName: form.displayName.trim(),
      slug: form.slug.trim(),
      publicArea: form.publicArea.trim(),
      acceptsOrders: form.acceptsOrders,
    });
    setSaved(true);
  };

  const copyStoreUrl = async () => {
    const url = `${typeof window === "undefined" ? "" : window.location.origin}/k/${form.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  return (
    <PageHead
      eyebrow="Customer-facing profile"
      title="Storefront"
      description="Control the details customers see on your public kitchen URL before they order."
      action={
        <div className="cluster">
          <Button size="sm" variant="secondary" type="button" onClick={() => void copyStoreUrl()}>
            <Copy aria-hidden="true" size={14} />
            {copied ? "Copied URL" : "Copy link"}
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href={`/k/${form.slug}`} target="_blank">
              <ExternalLink aria-hidden="true" size={14} />
              View live
            </Link>
          </Button>
        </div>
      }
    >
      <section className={`card ${styles.section}`}>
        {error ? (
          <p className={styles.errorBanner} role="alert">
            {error}
          </p>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.setting} style={{ paddingTop: 0 }}>
            <div>
              <h3>Storefront accepting orders</h3>
              <p>Paused storefronts remain browsable without accepting new orders.</p>
            </div>
            <Toggle
              value={form.acceptsOrders}
              label="Storefront accepting orders"
              onChange={(value) => updateField("acceptsOrders", value)}
            />
          </div>

          <div className={styles.formGrid}>
            <Field label="Kitchen name">
              <input
                value={form.displayName}
                onChange={(event) => updateField("displayName", event.target.value)}
              />
            </Field>
            <Field label="Storefront slug (mealhrs.com/k/...)">
              <input
                value={form.slug}
                onChange={(event) =>
                  updateField(
                    "slug",
                    event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
              />
            </Field>
          </div>

          <div className={styles.formGrid}>
            <Field label="Handle">
              <input value={form.handle} onChange={(event) => updateField("handle", event.target.value)} />
            </Field>
            <Field label="Business category">
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
              >
                <option>Nigerian kitchen</option>
                <option>Home kitchen</option>
                <option>Restaurant</option>
                <option>Soups &amp; swallow</option>
                <option>Bakery</option>
                <option>Caterer</option>
              </select>
            </Field>
          </div>

          <div className={styles.formGrid}>
            <Field label="Public area (private street stays hidden)">
              <input
                value={form.publicArea}
                onChange={(event) => updateField("publicArea", event.target.value)}
              />
            </Field>
            <Field label="Ordering hours display">
              <input
                value={form.orderingHoursLabel}
                onChange={(event) => updateField("orderingHoursLabel", event.target.value)}
              />
            </Field>
          </div>

          <div className={styles.formGrid}>
            <Field label="Instagram handle">
              <input
                value={form.instagramHandle}
                onChange={(event) => updateField("instagramHandle", event.target.value)}
              />
            </Field>
            <Field label="Public order contact phone">
              <input
                value={form.contactPhone}
                onChange={(event) => updateField("contactPhone", event.target.value)}
              />
            </Field>
          </div>

          <Field label="Brand accent tone (accessible)">
            <select
              value={form.accentPreset}
              onChange={(event) =>
                updateField("accentPreset", event.target.value as VendorStorefrontSettings["accentPreset"])
              }
            >
              <option value="herb">Herb Green (Default)</option>
              <option value="warm">Warm Tangerine</option>
              <option value="charcoal">Deep Charcoal</option>
            </select>
          </Field>

          <Field label="Kitchen story">
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </Field>

          <div className={styles.formFoot}>
            <Button type="submit">
              <Store aria-hidden="true" size={16} />
              Save storefront preview
            </Button>
            {saved ? (
              <p className={`${styles.formHint} ${styles.saved}`} role="status">
                <Check aria-hidden="true" size={14} />
                Saved locally for this preview
              </p>
            ) : (
              <p className={styles.formHint}>No customer-facing change is published in this frontend preview.</p>
            )}
          </div>
        </form>
      </section>
    </PageHead>
  );
}

type SettingsTab = "general" | "availability" | "team";

export function SettingsView({
  settings,
  operatingSchedule,
  teamMembers = [],
}: Readonly<{
  settings: VendorDashboardSettings;
  operatingSchedule?: VendorOperatingSchedule;
  teamMembers?: readonly VendorTeamMember[];
}>) {
  const {
    acceptsOrders,
    pauseImmediate,
    pausePreorders,
    setAcceptsOrders,
    setPauseImmediate,
    setPausePreorders,
  } = useVendorWorkspace();

  const [tab, setTab] = useState<SettingsTab>("general");
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [team, setTeam] = useState<readonly VendorTeamMember[]>(teamMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [teamFeedback, setTeamFeedback] = useState("");

  const [maxOrders, setMaxOrders] = useState(operatingSchedule?.maxSimultaneousOrders ?? 12);

  const saveGeneral = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail.trim())) {
      setError("Enter a valid support email address.");
      return;
    }
    setError("");
    setSaved(true);
  };

  const inviteMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const role = String(data.get("role") ?? "kitchen_staff") as VendorTeamRole;
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Provide a staff name and valid email address.");
      return;
    }
    setTeam((current) => [
      ...current,
      { id: `tm-${Date.now()}`, name, email, role, status: "invited" },
    ]);
    setInviteError("");
    setInviteOpen(false);
    setTeamFeedback(`Preview invite created for ${name} (${role.replace("_", " ")}). No email was sent.`);
  };

  return (
    <PageHead
      eyebrow="Workspace"
      title="Settings"
      description="Choose notifications, granular service pauses, team permissions, and compliance links."
    >
      <div className={styles.tabs} role="tablist" aria-label="Settings sections">
        {(
          [
            { id: "general", label: "Notifications & defaults" },
            { id: "availability", label: "Availability & pauses" },
            { id: "team", label: `Team & permissions (${team.length})` },
          ] as const
        ).map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "general" ? (
        <section className={`card ${styles.section}`}>
          <div className={styles.setting}>
            <div>
              <h3>New order notifications</h3>
              <p>Show an operational prompt when a new immediate order arrives.</p>
            </div>
            <Toggle
              value={form.orderNotifications}
              label="New order notifications"
              onChange={(value) => {
                setSaved(false);
                setForm({ ...form, orderNotifications: value });
              }}
            />
          </div>
          <div className={styles.setting}>
            <div>
              <h3>Pre-order reminders</h3>
              <p>Surface reminders before a pre-order cutoff.</p>
            </div>
            <Toggle
              value={form.mealDropReminders}
              label="Pre-order reminders"
              onChange={(value) => {
                setSaved(false);
                setForm({ ...form, mealDropReminders: value });
              }}
            />
          </div>

          <div className={styles.form} style={{ marginTop: 14 }}>
            {error ? (
              <p className={styles.errorBanner} role="alert">
                {error}
              </p>
            ) : null}
            <Field label="Default preparation estimate">
              <select
                value={form.defaultPreparationEstimate}
                onChange={(event) => {
                  setSaved(false);
                  setForm({ ...form, defaultPreparationEstimate: event.target.value });
                }}
              >
                <option>20–30 min</option>
                <option>25–35 min</option>
                <option>35–50 min</option>
              </select>
            </Field>
            <Field label="Support email">
              <input
                type="email"
                value={form.supportEmail}
                onChange={(event) => {
                  setSaved(false);
                  setError("");
                  setForm({ ...form, supportEmail: event.target.value });
                }}
              />
            </Field>
            <div className={styles.formFoot}>
              <Button type="button" onClick={saveGeneral}>
                Save settings preview
              </Button>
              {saved ? (
                <p className={`${styles.formHint} ${styles.saved}`} role="status">
                  Preferences saved locally
                </p>
              ) : null}
            </div>
          </div>

          <div className="cluster" style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-line)" }}>
            <Button asChild size="sm" variant="secondary">
              <Link href="/vendor/verification">
                <ShieldCheck aria-hidden="true" size={14} />
                Verification &amp; payout compliance
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/vendor/support">Kitchen support</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/vendor/onboarding">Revisit setup checklist</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {tab === "availability" ? (
        <section className={`card ${styles.section}`}>
          <h2>Granular service pauses</h2>
          <p>Pausing new orders never erases accepted immediate or pre-order commitments.</p>
          <div className={styles.setting}>
            <div>
              <h3>Accept orders on storefront</h3>
              <p>Master storefront status across immediate and scheduled offers.</p>
            </div>
            <Toggle
              value={acceptsOrders}
              label="Accept orders on storefront"
              onChange={(value) => setAcceptsOrders(value)}
            />
          </div>
          <div className={styles.setting}>
            <div>
              <h3>Pause immediate orders only</h3>
              <p>Keep scheduled pre-order batches open while pausing on-demand kitchen prep.</p>
            </div>
            <Toggle
              value={pauseImmediate}
              label="Pause immediate orders only"
              onChange={(value) => setPauseImmediate(value)}
            />
          </div>
          <div className={styles.setting}>
            <div>
              <h3>Pause new pre-orders only</h3>
              <p>Stop new pre-order bookings without affecting today&apos;s immediate menu.</p>
            </div>
            <Toggle
              value={pausePreorders}
              label="Pause new pre-orders only"
              onChange={(value) => setPausePreorders(value)}
            />
          </div>
          <div className={styles.form} style={{ marginTop: 14 }}>
            <Field label="Maximum simultaneous immediate orders">
              <input
                type="number"
                min={1}
                value={maxOrders}
                onChange={(event) => setMaxOrders(Math.max(1, Number(event.target.value) || 1))}
              />
            </Field>
            <Notice tone="info">
              Edit weekly opening hours under <Link href="/vendor/menu"><u>Menu → Ordering hours</u></Link>.
            </Notice>
          </div>
        </section>
      ) : null}

      {tab === "team" ? (
        <section className={`card ${styles.section}`}>
          <div className="split" style={{ marginBottom: 14 }}>
            <div>
              <h2>Staff roles &amp; permissions</h2>
              <p className="vendor-muted">
                Staff access is scoped strictly to this kitchen; unrelated businesses are never visible.
              </p>
            </div>
            <Button
              size="sm"
              type="button"
              onClick={() => {
                setInviteError("");
                setInviteOpen(true);
              }}
            >
              <UserPlus aria-hidden="true" size={14} />
              Invite staff
            </Button>
          </div>

          {teamFeedback ? (
            <p className={styles.feedback} role="status">
              {teamFeedback}
            </p>
          ) : null}

          <div>
            {team.map((member) => (
              <div className={styles.teamRow} key={member.id}>
                <div>
                  <strong>{member.name}</strong>
                  <span>
                    {member.email} · {member.status}
                  </span>
                </div>
                <div className={styles.teamControls}>
                  <select
                    aria-label={`Role for ${member.name}`}
                    value={member.role}
                    disabled={member.role === "owner"}
                    onChange={(event) => {
                      const nextRole = event.target.value as VendorTeamRole;
                      setTeam((current) =>
                        current.map((candidate) =>
                          candidate.id === member.id ? { ...candidate, role: nextRole } : candidate,
                        ),
                      );
                      setTeamFeedback(`Updated ${member.name} role to ${nextRole.replace("_", " ")} in preview.`);
                    }}
                  >
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="kitchen_staff">Kitchen staff</option>
                    <option value="content_manager">Content manager</option>
                  </select>
                  {member.role !== "owner" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setTeam((current) => current.filter((candidate) => candidate.id !== member.id));
                        setTeamFeedback(`Removed ${member.name} in this frontend preview.`);
                      }}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <Dialog.Root open={inviteOpen} onOpenChange={setInviteOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.dialogBackdrop} />
              <Dialog.Content className={styles.dialog} aria-modal="true">
                <div className={styles.dialogHead}>
                  <div>
                    <p className={styles.eyebrow}>Team preview</p>
                    <Dialog.Title>Invite staff member</Dialog.Title>
                    <Dialog.Description>
                      Assign least-privilege permissions for kitchen prep or content management.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className={styles.dialogClose} type="button" aria-label="Close staff invite">
                      <X aria-hidden="true" size={16} />
                    </button>
                  </Dialog.Close>
                </div>
                <form className={styles.dialogBody} onSubmit={inviteMember} noValidate>
                  {inviteError ? (
                    <p className={styles.errorBanner} role="alert">
                      {inviteError}
                    </p>
                  ) : null}
                  <Field label="Staff name">
                    <input name="name" placeholder="e.g. Chidi Eze" required />
                  </Field>
                  <Field label="Email address">
                    <input name="email" type="email" placeholder="staff@example.com" required />
                  </Field>
                  <Field label="Role">
                    <select name="role" defaultValue="kitchen_staff">
                      <option value="manager">Manager (menus, orders, content, reporting)</option>
                      <option value="kitchen_staff">Kitchen staff (assigned orders &amp; prep status)</option>
                      <option value="content_manager">Content manager (posts &amp; engagement)</option>
                    </select>
                  </Field>
                  <Button type="submit" block>
                    Send preview invite
                  </Button>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </section>
      ) : null}
    </PageHead>
  );
}

function PageHead({
  action,
  children,
  description,
  eyebrow,
  title,
}: Readonly<{
  action?: ReactNode;
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}>) {
  return (
    <div>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <p className={styles.lead}>{description}</p>
        </div>
        {action}
      </header>
      <div className="stack-lg">{children}</div>
    </div>
  );
}

function Metric({ detail, label, value }: Readonly<{ detail: string; label: string; value: string }>) {
  return (
    <article className={`card ${styles.metric}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function Fact({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className={styles.fact}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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

function Toggle({ label, onChange, value }: Readonly<{ label: string; onChange: (value: boolean) => void; value: boolean }>) {
  return (
    <button
      className={styles.switch}
      type="button"
      aria-label={label}
      aria-pressed={value}
      onClick={() => onChange(!value)}
    >
      <i />
    </button>
  );
}
