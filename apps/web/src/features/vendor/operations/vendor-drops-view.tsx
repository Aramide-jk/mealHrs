"use client";

import {
  asMealDropId,
  asVendorId,
  type MealDrop,
  type VendorDashboardSnapshot,
  type VendorDeliveryZone,
} from "@mealhrs/domain";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, Copy, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { isCutoffPassed } from "@/features/meal-drops/effective-availability";
import { useMenuPreview } from "@/lib/menu-preview-context";
import { useDeliveryPreview } from "@/lib/delivery-preview-context";
import styles from "./vendor-operations.module.css";

type DropDialogMode =
  | { kind: "create" }
  | { kind: "edit"; drop: MealDrop }
  | null;

const defaultFulfillmentStart = "13:00";
const defaultFulfillmentEnd = "16:00";

function formatTime(value: string) {
  const [hourText, minute = "00"] = value.split(":");
  const hour = Number(hourText);
  if (!Number.isFinite(hour)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minute} ${period}`;
}

function formatFulfillmentWindow(date: string, startTime: string, endTime: string) {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Africa/Lagos" }).format(new Date(`${date}T12:00:00+01:00`));
  return `${weekday}, ${formatTime(startTime)}–${formatTime(endTime)}`;
}

function parseFulfillmentWindow(window: string) {
  const matches = window.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!matches) return { startTime: defaultFulfillmentStart, endTime: defaultFulfillmentEnd };
  const to24Hour = (hour: number, minute: string, period?: string) => {
    const normalizedPeriod = period?.toUpperCase();
    const adjustedHour = normalizedPeriod === "PM" && hour < 12 ? hour + 12 : normalizedPeriod === "AM" && hour === 12 ? 0 : hour;
    return `${String(adjustedHour).padStart(2, "0")}:${minute}`;
  };
  const endPeriod = matches[6] ?? matches[3];
  return { startTime: to24Hour(Number(matches[1]), matches[2] ?? "00", matches[3] ?? endPeriod), endTime: to24Hour(Number(matches[4]), matches[5] ?? "00", endPeriod) };
}

export function VendorDropsView({
  mealDrops,
  menu = [],
  deliveryZones = [],
  now,
}: Readonly<{
  mealDrops: readonly MealDrop[];
  menu?: VendorDashboardSnapshot["menu"];
  deliveryZones?: readonly VendorDeliveryZone[];
  now: string;
}>) {
  void mealDrops;
  const { addMealDrop, mealDrops: previewDrops, updateMealDrop } = useMenuPreview();
  const deliveryPreview = useDeliveryPreview();
  const currentDeliveryZones = deliveryPreview.vendorId ? deliveryPreview.zones : deliveryZones;
  const drops = previewDrops.length ? previewDrops : mealDrops;
  const [paused, setPaused] = useState<Set<string>>(new Set());
  const [dialogMode, setDialogMode] = useState<DropDialogMode>(null);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [fulfillmentDate, setFulfillmentDate] = useState("");
  const [fulfillmentStart, setFulfillmentStart] = useState(defaultFulfillmentStart);
  const [fulfillmentEnd, setFulfillmentEnd] = useState(defaultFulfillmentEnd);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const seqRef = useRef(1);
  const nowMs = new Date(now).getTime();

  const handleSaveDrop = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const fulfillmentDate = String(form.get("fulfillmentDate") ?? "").trim();
    const fulfillmentStartTime = String(form.get("fulfillmentStart") ?? "").trim();
    const fulfillmentEndTime = String(form.get("fulfillmentEnd") ?? "").trim();
    const cutoffAtRaw = String(form.get("cutoffAt") ?? "").trim();
    const capacity = Number(form.get("capacity"));
    const recurring = form.get("recurring") === "on";
    const selectedOfferIds = form.getAll("offerIds").map(String);

    if (name.length < 3 || !fulfillmentDate || !fulfillmentStartTime || !fulfillmentEndTime || !cutoffAtRaw) {
      setFormError("Complete the batch name, fulfillment date and times, and order cutoff.");
      return;
    }
    if (fulfillmentStartTime >= fulfillmentEndTime) { setFormError("Fulfillment end time must be after the start time."); return; }
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setFormError("Set a positive batch capacity.");
      return;
    }

    const cutoffIso = cutoffAtRaw.includes("+") || cutoffAtRaw.endsWith("Z")
      ? cutoffAtRaw
      : `${cutoffAtRaw}:00+01:00`;
    const fulfillmentStartsAt = new Date(`${fulfillmentDate}T${fulfillmentStartTime}:00+01:00`).getTime();
    if (!Number.isFinite(fulfillmentStartsAt) || new Date(cutoffIso).getTime() >= fulfillmentStartsAt) { setFormError("The order cutoff must be before fulfillment begins."); return; }
    const fulfillmentWindow = formatFulfillmentWindow(fulfillmentDate, fulfillmentStartTime, fulfillmentEndTime);

    const matchedItems = selectedOfferIds.flatMap((offerId) => {
          const entry = menu.find((candidate) => candidate.offer.id === offerId);
          return entry ? [{ dishId: entry.dish.id, offerId: entry.offer.id, quantityLimit: 4 }] : [];
        });
    if (!matchedItems.length) { setFormError("Select at least one menu dish for this pre-order batch."); return; }

    if (dialogMode?.kind === "edit") {
      const target = dialogMode.drop;
      updateMealDrop(target.id, (drop) => ({
        ...drop,
        name,
        description: description || drop.description,
        fulfillmentDate,
        fulfillmentWindow,
        cutoffAt: cutoffIso,
        capacity,
        remainingCapacity: Math.min(drop.remainingCapacity, capacity),
        items: matchedItems,
      }));
      setFeedback(`${name} updated in this frontend preview.`);
    } else {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const newDrop: MealDrop = {
        id: asMealDropId(`drop-preview-${seqRef.current++}`),
        vendorId: mealDrops[0]?.vendorId ?? menu[0]?.dish.vendorId ?? asVendorId("vendor-amaka"),
        slug: slug || "custom-meal-drop",
        name,
        description:
          description ||
          `${recurring ? "Weekly recurring batch. " : ""}Scheduled kitchen batch with automatic cutoff enforcement.`,
        imageUrl: menu[0]?.dish.imageUrl ?? "/assets/hero-jollof.png",
        timezone: "Africa/Lagos",
        cutoffAt: cutoffIso,
        fulfillmentDate,
        fulfillmentWindow,
        status: "open",
        capacity,
        remainingCapacity: capacity,
        items: matchedItems,
      };
      addMealDrop(newDrop);
      setFeedback(
        `${name} created${recurring ? " (weekly schedule preview)" : ""} in this frontend preview only.`,
      );
    }

    setFormError("");
    setDialogMode(null);
  };

  const duplicateDrop = (drop: MealDrop) => {
    const nextCutoff = new Date(nowMs + 4 * 24 * 60 * 60 * 1000).toISOString();
    const nextDate = new Date(nowMs + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const copy: MealDrop = {
      ...drop,
      id: asMealDropId(`drop-copy-${seqRef.current++}`),
      name: `${drop.name} (Next batch)`,
      cutoffAt: nextCutoff,
      fulfillmentDate: nextDate,
      status: "open",
      remainingCapacity: drop.capacity,
    };
    addMealDrop(copy);
    setFeedback(`Copied "${drop.name}" into a new open batch in this frontend preview.`);
  };

  const copyShareUrl = async (drop: MealDrop) => {
    const url = `${typeof window === "undefined" ? "" : window.location.origin}/drops/${drop.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setFeedback(`Share link copied for ${drop.name}.`);
    } catch {
      setFeedback(`Share URL ready: /drops/${drop.id}`);
    }
  };

  const nextWeekDefaultDate = new Date(nowMs + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const nextWeekDefaultCutoff = new Date(nowMs + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Pre-orders</p>
          <h1>Pre-order Batches</h1>
          <p>Manage scheduled batches separately from immediate kitchen availability.</p>
        </div>
        <Button
          size="sm"
          aria-label="Create Meal Drop"
          onClick={() => {
            setFormError("");
            setFulfillmentDate(nextWeekDefaultDate);
            setFulfillmentStart(defaultFulfillmentStart);
            setFulfillmentEnd(defaultFulfillmentEnd);
            setRepeatWeekly(false);
            setDialogMode({ kind: "create" });
          }}
        >
          <Plus aria-hidden="true" />
          Create Meal Drop
        </Button>
      </header>

      {feedback ? (
        <p className={styles.feedback} role="status">
          {feedback}
        </p>
      ) : null}

      <section className={styles.list}>
        {drops.map((drop) => {
          const cutoffPassed = isCutoffPassed(drop.cutoffAt, now);
          const statusLabel =
            cutoffPassed || drop.status === "cutoff_passed"
              ? "Cutoff passed"
              : drop.remainingCapacity <= 0 || drop.status === "sold_out"
                ? "Sold out"
                : drop.status === "cancelled"
                  ? "Cancelled"
                  : paused.has(drop.id)
                      ? "Paused"
                      : "Open for pre-order";
          const isClosed = statusLabel !== "Open for pre-order" && statusLabel !== "Paused";
          const sold = Math.max(0, drop.capacity - drop.remainingCapacity);
          const progressPct = drop.capacity > 0 ? Math.min(100, Math.round((sold / drop.capacity) * 100)) : 0;

          return (
            <article className={`card ${styles.drop}`} key={drop.id}>
              <div>
                <div className="cluster">
                  <Status tone={statusLabel === "Open for pre-order" ? "success" : statusLabel === "Paused" ? "warning" : "neutral"}>
                    {statusLabel}
                  </Status>
                  <span className={styles.fact}>
                    <CalendarDays aria-hidden="true" size={12} />
                    {drop.fulfillmentDate} · {drop.fulfillmentWindow} WAT
                  </span>
                </div>
                <h2>{drop.name}</h2>
                <p>{drop.description}</p>
                <div className={styles.dropProgress} aria-label={`${sold} of ${drop.capacity} places reserved`}>
                  <span style={{ width: `${progressPct}%` }} />
                </div>
                <div className={styles.facts}>
                  <span className={styles.fact}>
                    {sold} reserved · {drop.remainingCapacity} remaining
                  </span>
                  <span className={styles.fact}>{drop.items.length} dish{drop.items.length === 1 ? "" : "es"}</span>
                </div>
              </div>

              <div className={styles.actionGroup}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setFormError("");
                    const schedule = parseFulfillmentWindow(drop.fulfillmentWindow);
                    setFulfillmentDate(drop.fulfillmentDate);
                    setFulfillmentStart(schedule.startTime);
                    setFulfillmentEnd(schedule.endTime);
                    setRepeatWeekly(false);
                    setDialogMode({ kind: "edit", drop });
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="secondary" onClick={() => duplicateDrop(drop)}>
                  Duplicate
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void copyShareUrl(drop)}>
                  <Copy aria-hidden="true" size={14} />
                  Share
                </Button>
                {!isClosed ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setPaused((current) => {
                        const next = new Set(current);
                        if (next.has(drop.id)) next.delete(drop.id);
                        else next.add(drop.id);
                        return next;
                      });
                      setFeedback(
                        `${drop.name} ${paused.has(drop.id) ? "resumed" : "paused"} in this frontend preview.`,
                      );
                    }}
                  >
                    {paused.has(drop.id) ? "Resume" : "Pause"}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant={isClosed ? "secondary" : "danger"}
                  disabled={isClosed}
                  onClick={() => {
                    updateMealDrop(drop.id, (current) => ({ ...current, status: "cancelled" }));
                    setFeedback(`${drop.name} is closed in this frontend preview.`);
                  }}
                >
                  {isClosed ? statusLabel : "Close pre-orders"}
                </Button>
              </div>
            </article>
          );
        })}
      </section>

      <Dialog.Root open={Boolean(dialogMode)} onOpenChange={(open) => !open && setDialogMode(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.menuDialogBackdrop} />
          {dialogMode ? (
            <Dialog.Content className={styles.menuDialog} aria-modal="true">
              <header>
                <div>
                  <p className={styles.eyebrow}>
                    {dialogMode.kind === "create" ? "New pre-order batch" : "Edit pre-order batch"}
                  </p>
                  <Dialog.Title>
                    {dialogMode.kind === "create" ? "Create pre-order batch" : dialogMode.drop.name}
                  </Dialog.Title>
                  <Dialog.Description>
                    Set the dishes, cutoff, capacity and fulfillment schedule for this batch.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className={styles.close} type="button" aria-label="Close pre-order batch form">
                    <X aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </header>
              <form onSubmit={handleSaveDrop} noValidate>
                {formError ? (
                  <p className={styles.errorBanner} role="alert">
                    {formError}
                  </p>
                ) : null}
                <label>
                  Drop name
                  <input
                    name="name"
                    aria-label="Drop name"
                    defaultValue={dialogMode.kind === "edit" ? dialogMode.drop.name : ""}
                    placeholder="e.g. Friday Smokehouse Jollof"
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    defaultValue={dialogMode.kind === "edit" ? dialogMode.drop.description : ""}
                    placeholder="What makes this batch special and how it will be fulfilled"
                  />
                </label>
                <div className={styles.menuFormGrid}>
                  <label>
                    Fulfillment date
                    <input
                      name="fulfillmentDate"
                      type="date"
                      value={fulfillmentDate}
                      onChange={(event) => setFulfillmentDate(event.target.value)}
                      required
                    />
                  </label>
                  <fieldset className={styles.fulfillmentTimes}><legend>Fulfillment times (WAT)</legend><div><label>Start time<input name="fulfillmentStart" type="time" value={fulfillmentStart} onChange={(event) => setFulfillmentStart(event.target.value)} required /></label><label>End time<input name="fulfillmentEnd" type="time" value={fulfillmentEnd} onChange={(event) => setFulfillmentEnd(event.target.value)} required /></label></div><p aria-live="polite">Customer sees: {fulfillmentDate ? formatFulfillmentWindow(fulfillmentDate, fulfillmentStart, fulfillmentEnd) : "Choose a fulfillment date"}</p></fieldset>
                </div>
                <div className={styles.menuFormGrid}>
                  <label>
                    Order cutoff (WAT)
                    <input
                      name="cutoffAt"
                      type="datetime-local"
                      defaultValue={
                        dialogMode.kind === "edit"
                          ? dialogMode.drop.cutoffAt.slice(0, 16)
                          : nextWeekDefaultCutoff
                      }
                      required
                    />
                  </label>
                  <label>
                    Maximum orders
                    <input
                      name="capacity"
                      type="number"
                      min={1}
                      defaultValue={dialogMode.kind === "edit" ? dialogMode.drop.capacity : 30}
                      required
                    />
                  </label>
                </div>

                {menu.length ? (
                  <div className="stack">
                    <span style={{ fontSize: "0.68rem", fontWeight: 600 }}>Include menu dishes</span>
                    <div className={styles.dropCheckList}>
                      {menu.map(({ dish, offer }) => (
                        <label className={styles.dropCheckItem} key={offer.id}>
                          <input
                            type="checkbox"
                            name="offerIds"
                            value={offer.id}
                            defaultChecked={
                              dialogMode.kind === "edit"
                                ? dialogMode.drop.items.some((item) => item.offerId === offer.id)
                                : true
                            }
                          />
                          <span>
                            {dish.name} · {dish.category} · ₦{offer.price.amount.toLocaleString("en-NG")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                {currentDeliveryZones.length ? (
                  <div className="stack">
                    <div className="split"><span style={{ fontSize: "0.68rem", fontWeight: 600 }}>Scheduled delivery zones</span><Link className={styles.zoneLink} href="/vendor/delivery">Manage zones</Link></div>
                    <p className={styles.zoneHelp}>This batch uses your enabled scheduled-delivery zones.</p>
                    <div className="cluster">
                      {currentDeliveryZones
                        .filter((zone) => zone.enabled && zone.scheduledEnabled)
                        .map((zone) => (
                          <span className={styles.previewPill} key={zone.areaId}>
                            {zone.name}
                          </span>
                        ))}
                    </div>
                  </div>
                ) : null}

                <label className={styles.dropCheckItem}>
                  <input type="checkbox" name="recurring" checked={repeatWeekly} onChange={(event) => setRepeatWeekly(event.target.checked)} />
                  <span>Repeat weekly</span>
                </label>
                {repeatWeekly ? <p className={styles.repeatHelp}>Creates a separate dated preview batch each week using this schedule. You can review each batch before it is available to customers.</p> : null}

                <footer className={styles.dropDialogFooter}>
                  <Button type="submit" block aria-label="Publish drop preview">
                    {dialogMode.kind === "create" ? "Publish drop preview" : "Save pre-order batch"}
                  </Button>
                </footer>
              </form>
            </Dialog.Content>
          ) : null}
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
