"use client";

import {
  asAreaId,
  formatMoney,
  ngn,
  type AreaId,
  type VendorDeliveryZone,
  type VendorPickupSettings,
} from "@mealhrs/domain";
import * as Dialog from "@radix-ui/react-dialog";
import { Clock3, MapPinned, Store, Trash2, Truck, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { useDeliveryPreview } from "@/lib/delivery-preview-context";
import { Field, PageHead } from "./vendor-insights-primitives";
import styles from "./vendor-insights.module.css";

const ESTIMATE_PRESETS = ["20–35 min", "35–50 min", "45–60 min", "60–90 min"] as const;

export function VendorDeliveryView({
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

  const [selectedAreaId, setSelectedAreaId] = useState<string>(zones[0]?.areaId ?? "");
  const [previewMode, setPreviewMode] = useState<"immediate" | "meal_drop">("immediate");

  const [fallbackPickup, setFallbackPickup] = useState<VendorPickupSettings>(
    pickupSettings ?? {
      mode: "both",
      addressNote: "Shared privately only after an eligible pickup order is confirmed.",
      windowNote: "Daily 11:00 AM–7:30 PM",
      pickupAddress: "14 Adeola Odeku St, Victoria Island, Lagos",
      landmark: "Beside Silverbird Galleria",
    },
  );
  const pickup = deliveryPreview.pickup ?? fallbackPickup;
  const pickupEnabled = pickup.mode !== "delivery";

  const [addOpen, setAddOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<VendorDeliveryZone | null>(null);
  const [feedback, setFeedback] = useState("");
  const [formError, setFormError] = useState("");

  const [addEstimate, setAddEstimate] = useState<string>("35–50 min");
  const [editEstimate, setEditEstimate] = useState<string>("35–50 min");

  const activeZone = currentZones.find((zone) => zone.areaId === selectedAreaId);

  const saveZone = (zone: VendorDeliveryZone) => {
    if (deliveryPreview.vendorId) {
      deliveryPreview.addZone(zone);
    } else {
      setFallbackZones((items) =>
        items.some((item) => item.areaId === zone.areaId)
          ? items.map((item) => (item.areaId === zone.areaId ? zone : item))
          : [...items, zone],
      );
    }
  };

  const updateZone = (
    areaId: AreaId,
    update: (zone: VendorDeliveryZone) => VendorDeliveryZone,
  ) => {
    if (deliveryPreview.vendorId) {
      deliveryPreview.updateZone(areaId, update);
    } else {
      setFallbackZones((items) =>
        items.map((zone) => (zone.areaId === areaId ? update(zone) : zone)),
      );
    }
  };

  const removeZone = (areaId: AreaId, name: string) => {
    if (deliveryPreview.vendorId) {
      deliveryPreview.removeZone(areaId);
    } else {
      setFallbackZones((items) => items.filter((zone) => zone.areaId !== areaId));
    }
    if (selectedAreaId === areaId) {
      const remaining = currentZones.filter((zone) => zone.areaId !== areaId);
      setSelectedAreaId(remaining[0]?.areaId ?? "");
    }
    setFeedback(`${name} removed from delivery coverage in this preview.`);
  };

  const savePickup = (next: VendorPickupSettings) => {
    if (deliveryPreview.vendorId) {
      deliveryPreview.setPickup(next);
    } else {
      setFallbackPickup(next);
    }
  };

  const handleAddZone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const fee = Number(form.get("fee"));
    const minOrder = Number(form.get("minOrder") ?? 0);
    const estimate = String(form.get("estimate") ?? addEstimate).trim() || "35–50 min";

    if (name.length < 2 || !Number.isFinite(fee) || fee < 0) {
      setFormError("Enter a valid area name and non-negative delivery fee.");
      return;
    }
    if (form.get("immediate") !== "on" && form.get("scheduled") !== "on") {
      setFormError("Enable immediate orders, pre-orders, or both for this zone.");
      return;
    }

    const existingArea = availableAreas.find(
      (candidate) => candidate.name.toLowerCase() === name.toLowerCase(),
    );
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
    setSelectedAreaId(areaId);
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
    const estimate = String(form.get("estimate") ?? editEstimate).trim() || editingZone.estimate;

    if (!Number.isFinite(fee) || fee < 0) {
      setFormError("Delivery fee must be ₦0 or more.");
      return;
    }
    if (form.get("immediate") !== "on" && form.get("scheduled") !== "on") {
      setFormError("Enable immediate orders, pre-orders, or both for this zone.");
      return;
    }

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

  // Derive eligibility text for preview
  const getEligibilityMessage = () => {
    if (!activeZone) {
      return "Select an area to preview customer delivery terms.";
    }
    if (!activeZone.enabled) {
      return `${activeZone.name} is currently paused. Delivery checkout is disabled for this area.`;
    }
    const isModeEnabled =
      previewMode === "immediate"
        ? activeZone.immediateEnabled
        : activeZone.scheduledEnabled;

    if (!isModeEnabled) {
      const modeLabel = previewMode === "immediate" ? "immediate orders" : "scheduled pre-orders";
      if (pickupEnabled) {
        return `Delivery is not enabled for ${modeLabel} in ${activeZone.name}. Customers will be offered collection during ${pickup.windowNote} instead.`;
      }
      return `This kitchen is not accepting ${modeLabel} in ${activeZone.name}, and pickup is turned off. Customers cannot order.`;
    }

    return `${activeZone.name} customers see delivery at ${formatMoney(activeZone.deliveryFee)} (${activeZone.estimate}) for ${previewMode === "immediate" ? "immediate orders" : "pre-orders"} · Min order ${formatMoney(activeZone.minimumOrder)}.`;
  };

  return (
    <PageHead
      eyebrow="Fulfillment"
      title="Delivery zones"
      description="Choose where your kitchen delivers, set dispatch fees, and manage pickup terms. Changes are local frontend previews."
      action={
        <Button
          size="sm"
          onClick={() => {
            setFormError("");
            setAddEstimate("35–50 min");
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
        <div className="split" style={{ marginBottom: 14 }}>
          <div>
            <h2>Configured delivery areas ({currentZones.length})</h2>
            <p className="vendor-muted" style={{ margin: 0 }}>
              MealHrs vendors fulfill their own delivery. Set custom fees and minimum order amounts per neighborhood.
            </p>
          </div>
        </div>

        {currentZones.length === 0 ? (
          <div style={{ padding: "30px 16px", textAlign: "center" }}>
            <p style={{ margin: "0 0 12px", color: "var(--color-muted)", fontSize: "0.8rem" }}>
              No delivery zones configured yet.
            </p>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              Add your first delivery zone
            </Button>
          </div>
        ) : (
          <div className={styles.zoneList}>
            {currentZones.map((zone) => (
              <div className={styles.zone} key={zone.areaId}>
                <div>
                  <div className="cluster" style={{ gap: 8, alignItems: "center" }}>
                    <strong>{zone.name}</strong>
                    <Status tone={zone.enabled ? "success" : "neutral"}>
                      {zone.enabled ? "Active" : "Paused"}
                    </Status>
                  </div>
                  <span>
                    {formatMoney(zone.deliveryFee)} fee · {zone.estimate} · Min {formatMoney(zone.minimumOrder)}
                    {zone.immediateEnabled && zone.scheduledEnabled
                      ? " · Immediate & pre-orders"
                      : zone.scheduledEnabled
                        ? " · Pre-orders only"
                        : zone.immediateEnabled
                          ? " · Immediate only"
                          : ""}
                  </span>
                </div>
                <div className={styles.zoneActions}>
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setEditEstimate(zone.estimate);
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
                  <button
                    type="button"
                    className={styles.zoneRemove}
                    aria-label={`Remove ${zone.name} zone`}
                    title={`Remove ${zone.name}`}
                    onClick={() => removeZone(zone.areaId, zone.name)}
                  >
                    <Trash2 aria-hidden="true" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.preview}>
          <div style={{ flex: "1 1 auto" }}>
            <div className="cluster" style={{ gap: 8, marginBottom: 4, alignItems: "center" }}>
              <strong style={{ fontSize: "0.74rem" }}>Eligibility preview</strong>
              <div className="cluster" style={{ gap: 4 }}>
                <button
                  type="button"
                  className={`${styles.pillOption} ${previewMode === "immediate" ? styles.pillOptionActive : ""}`}
                  onClick={() => setPreviewMode("immediate")}
                >
                  <Truck aria-hidden="true" size={12} style={{ display: "inline", marginRight: 4 }} />
                  Immediate
                </button>
                <button
                  type="button"
                  className={`${styles.pillOption} ${previewMode === "meal_drop" ? styles.pillOptionActive : ""}`}
                  onClick={() => setPreviewMode("meal_drop")}
                >
                  <Clock3 aria-hidden="true" size={12} style={{ display: "inline", marginRight: 4 }} />
                  Pre-order drop
                </button>
              </div>
            </div>
            <p>{getEligibilityMessage()}</p>
          </div>
          <select
            aria-label="Preview delivery zone"
            value={selectedAreaId}
            onChange={(event) => setSelectedAreaId(event.target.value)}
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
        <p>
          MealHrs does not assign independent riders. Vendors manage their own delivery and optional pickup.
        </p>
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <Field label="Fulfillment options">
              <select
                value={pickup.mode}
                onChange={(event) =>
                  savePickup({
                    ...pickup,
                    mode: event.target.value as VendorPickupSettings["mode"],
                  })
                }
              >
                <option value="both">Delivery and pickup</option>
                <option value="delivery">Delivery only</option>
                <option value="pickup">Pickup only</option>
              </select>
            </Field>
            {pickupEnabled ? (
              <Field label="Regular pickup hours">
                <input
                  value={pickup.windowNote}
                  onChange={(event) =>
                    savePickup({ ...pickup, windowNote: event.target.value })
                  }
                  placeholder="e.g. Daily 11:00 AM–7:30 PM"
                />
              </Field>
            ) : null}
          </div>

          {pickupEnabled ? (
            <>
              <div className={styles.formGrid}>
                <Field label="Kitchen pickup address (shared on confirmation)">
                  <input
                    value={pickup.pickupAddress ?? ""}
                    onChange={(event) =>
                      savePickup({ ...pickup, pickupAddress: event.target.value })
                    }
                    placeholder="e.g. 14 Adeola Odeku St, Victoria Island"
                  />
                </Field>
                <Field label="Nearby landmark / collection note">
                  <input
                    value={pickup.landmark ?? ""}
                    onChange={(event) =>
                      savePickup({ ...pickup, landmark: event.target.value })
                    }
                    placeholder="e.g. Beside Silverbird Galleria, Gate 2"
                  />
                </Field>
              </div>

              <Field
                label="Pickup address privacy policy"
                hint="Assures customers their address and your kitchen location stay private until payment is confirmed."
              >
                <input
                  value={pickup.addressNote}
                  onChange={(event) =>
                    savePickup({ ...pickup, addressNote: event.target.value })
                  }
                />
              </Field>

              <div className={styles.formFoot}>
                <Button
                  size="sm"
                  type="button"
                  onClick={() =>
                    setFeedback("Fulfillment and pickup rules saved in this frontend preview.")
                  }
                >
                  <Store aria-hidden="true" size={14} />
                  Save pickup settings
                </Button>
              </div>
            </>
          ) : (
            <Notice tone="info">
              Pickup details are hidden from customers while delivery only is selected.
            </Notice>
          )}
        </div>
      </section>

      {/* Add Zone Dialog */}
      <Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogBackdrop} />
          <Dialog.Content className={styles.dialog} aria-modal="true">
            <div className={styles.dialogHead}>
              <div>
                <p className={styles.eyebrow}>Delivery coverage</p>
                <Dialog.Title>Add delivery zone</Dialog.Title>
                <Dialog.Description>
                  Configure a named neighborhood with delivery fee, minimum order, and fulfillment types.
                </Dialog.Description>
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
                <div>
                  <input
                    name="estimate"
                    value={addEstimate}
                    onChange={(e) => setAddEstimate(e.target.value)}
                  />
                  <div className={styles.pillGroup}>
                    {ESTIMATE_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`${styles.pillOption} ${addEstimate === preset ? styles.pillOptionActive : ""}`}
                        onClick={() => setAddEstimate(preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
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

      {/* Edit Zone Dialog */}
      <Dialog.Root
        open={Boolean(editingZone)}
        onOpenChange={(open) => !open && setEditingZone(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogBackdrop} />
          {editingZone ? (
            <Dialog.Content className={styles.dialog} aria-modal="true">
              <div className={styles.dialogHead}>
                <div>
                  <p className={styles.eyebrow}>Edit zone</p>
                  <Dialog.Title>{editingZone.name}</Dialog.Title>
                  <Dialog.Description>
                    Adjust delivery fee, minimum order, and operational fulfillment rules.
                  </Dialog.Description>
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
                    <input
                      name="fee"
                      type="number"
                      min={0}
                      defaultValue={editingZone.deliveryFee.amount}
                      required
                    />
                  </Field>
                  <Field label="Minimum order (₦)">
                    <input
                      name="minOrder"
                      type="number"
                      min={0}
                      defaultValue={editingZone.minimumOrder.amount}
                    />
                  </Field>
                </div>
                <Field label="Estimated delivery window">
                  <div>
                    <input
                      name="estimate"
                      value={editEstimate}
                      onChange={(e) => setEditEstimate(e.target.value)}
                    />
                    <div className={styles.pillGroup}>
                      {ESTIMATE_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className={`${styles.pillOption} ${editEstimate === preset ? styles.pillOptionActive : ""}`}
                          onClick={() => setEditEstimate(preset)}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </Field>
                <label className="cluster" style={{ fontSize: "0.72rem" }}>
                  <input
                    type="checkbox"
                    name="immediate"
                    defaultChecked={editingZone.immediateEnabled}
                  />
                  <span>Allow immediate orders</span>
                </label>
                <label className="cluster" style={{ fontSize: "0.72rem" }}>
                  <input
                    type="checkbox"
                    name="scheduled"
                    defaultChecked={editingZone.scheduledEnabled}
                  />
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
