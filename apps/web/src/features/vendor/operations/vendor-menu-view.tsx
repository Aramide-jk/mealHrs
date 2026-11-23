"use client";

import {
  formatMoney,
  ngn,
  type DishOptionGroup,
  type Money,
  type VendorDashboardSnapshot,
  type VendorOperatingSchedule,
} from "@mealhrs/domain";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { Clock3, Copy, Edit3, Minus, Plus, Trash2, UtensilsCrossed, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { DishOptionsEditor, normalizeOptionGroups } from "./dish-options-editor";
import { useMenuPreview } from "@/lib/menu-preview-context";
import styles from "./vendor-operations.module.css";

type EditableDishItem = Readonly<{
  id: string;
  name: string;
  description: string;
  category: string;
  price: Money;
  preparationEstimate: string;
  orderingMode: "immediate" | "meal_drop";
  imageUrl?: string;
  allergens: readonly string[];
  dailyLimit: number;
  optionGroups: readonly DishOptionGroup[];
  preview?: boolean;
}>;

type MenuTab = "all" | "immediate" | "meal_drop" | "hours";

const previewPhotos = [
  { label: "No photo (placeholder)", value: "" },
  { label: "Jollof rice photo", value: "/assets/hero-jollof.png" },
  { label: "Egusi & swallow photo", value: "/assets/egusi-pounded-yam.png" },
  { label: "Bakery box photo", value: "/assets/bakery-drop.png" },
] as const;

const dishPlaceholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='540' viewBox='0 0 720 540'%3E%3Crect width='720' height='540' fill='%23edf3ee'/%3E%3Ccircle cx='360' cy='270' r='118' fill='%23d7e5da'/%3E%3Cpath d='M272 278c22 52 62 78 88 78s66-26 88-78' fill='none' stroke='%2365786b' stroke-width='18' stroke-linecap='round'/%3E%3Cpath d='M312 230h96' stroke='%2365786b' stroke-width='18' stroke-linecap='round'/%3E%3C/svg%3E";

const menuCategories = [
  "Rice meals",
  "Soups & swallow",
  "Grills",
  "Small chops",
  "Bakes & snacks",
  "Drinks",
  "Sides",
  "Kitchen special",
] as const;

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Unable to read image.")));
    reader.addEventListener("error", () => reject(new Error("Unable to read image.")));
    reader.readAsDataURL(file);
  });
}

export function VendorMenuView({
  menu,
  operatingSchedule,
}: Readonly<Pick<VendorDashboardSnapshot, "menu"> & { operatingSchedule?: VendorOperatingSchedule }>) {
  void menu;
  void operatingSchedule;
  const preview = useMenuPreview();
  const [tab, setTab] = useState<MenuTab>("all");
  const items: readonly EditableDishItem[] = preview.items.map((item) => ({
    id: item.offer.id,
    name: item.dish.name,
    description: item.dish.description,
    category: item.dish.category,
    price: item.offer.price,
    preparationEstimate: item.offer.availability.status === "available_now" ? item.offer.availability.preparationEstimate : item.offer.availability.status === "preorder" ? item.offer.availability.fulfillmentWindow : item.offer.availability.reason,
    orderingMode: item.offer.orderingMode,
    imageUrl: item.dish.imageUrl,
    allergens: item.dish.allergens,
    dailyLimit: item.dailyLimit,
    optionGroups: item.dish.optionGroups,
    preview: item.archived,
  }));

  const [addOpen, setAddOpen] = useState(false);
  const [addOptionGroups, setAddOptionGroups] = useState<DishOptionGroup[]>([]);
  const [editing, setEditing] = useState<EditableDishItem | null>(null);
  const [addError, setAddError] = useState("");
  const [addPhotoUrls, setAddPhotoUrls] = useState<readonly string[]>([]);
  const [feedback, setFeedback] = useState("");
  const seqRef = useRef(1);

  const schedule = preview.schedule;

  const toggleAvailability = (id: string, name: string) => {
    const source = preview.items.find((item) => item.offer.id === id);
    if (!source) return;
    const isAvailable = !source.archived && source.remainingToday > 0 && source.offer.availability.status !== "unavailable";
    preview.updateItem(id, (item) => ({
      ...item,
      offer: item.offer.orderingMode === "immediate"
        ? { ...item.offer, availability: isAvailable ? { status: "unavailable", reason: "Paused by kitchen in this frontend preview." } : { status: "available_now", preparationEstimate: item.offer.availability.status === "available_now" ? item.offer.availability.preparationEstimate : "25–35 min" } }
        : { ...item.offer, availability: isAvailable ? { status: "unavailable", reason: "Pre-orders paused by kitchen in this frontend preview." } : { status: "preorder", cutoffAt: preview.mealDrops.find((drop) => drop.id === item.offer.mealDropId)?.cutoffAt ?? new Date(Date.now() + 86_400_000).toISOString(), fulfillmentWindow: preview.mealDrops.find((drop) => drop.id === item.offer.mealDropId)?.fulfillmentWindow ?? "Scheduled window" } },
    }));
    setFeedback(`${name} ${isAvailable ? "paused" : "marked available"} in this frontend preview.`);
  };

  const createDish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const categoryChoice = String(form.get("category") ?? "").trim();
    const customCategory = String(form.get("customCategory") ?? "").trim();
    const category = (categoryChoice === "other" ? customCategory : categoryChoice).trim() || "Kitchen special";
    const description =
      String(form.get("description") ?? "").trim() || "Prepared fresh to order in small batches.";
    const price = Number(form.get("price"));
    const orderingMode = form.get("orderingMode") === "meal_drop" ? "meal_drop" : "immediate";
    const preparation = String(form.get("preparation") ?? "25–35 min").trim() || "25–35 min";
    const allergens = String(form.get("allergens") ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    const dailyLimit = Math.max(1, Number(form.get("dailyLimit") ?? 25) || 25);

    if (name.length < 2) {
      setAddError("Enter a dish name of at least 2 characters.");
      return;
    }
    if (category.length < 2) {
      setAddError("Choose a category, or enter a custom category of at least 2 characters.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setAddError("Enter a valid price greater than ₦0.");
      return;
    }

    const ids = preview.nextIds();
    const optionGroups = normalizeOptionGroups(addOptionGroups);
    const vendorId = preview.items[0]?.dish.vendorId;
    const photo = addPhotoUrls[0] || dishPlaceholderImage;
    const photos = addPhotoUrls.length ? addPhotoUrls : [photo];
    const fulfillmentDate = String(form.get("fulfillmentDate") ?? "").trim();
    const fulfillmentWindow = String(form.get("fulfillmentWindow") ?? "").trim();
    const cutoffAt = String(form.get("cutoffAt") ?? "").trim();
    const capacity = Math.max(1, Number(form.get("capacity") ?? 0));
    const quantityLimit = Math.max(1, Number(form.get("quantityLimit") ?? 0));
    if (!vendorId) { setAddError("Menu preview is not ready yet."); return; }
    if (orderingMode === "meal_drop" && (!fulfillmentDate || !fulfillmentWindow || !cutoffAt || !Number.isFinite(capacity) || !Number.isFinite(quantityLimit))) { setAddError("Add a cutoff, fulfillment date and window, capacity, and per-customer limit for this pre-order batch."); return; }
    const drop = orderingMode === "meal_drop" ? { id: ids.mealDropId, vendorId, slug: `preview-drop-${seqRef.current++}`, name: `${name} Pre-order Batch`, description, imageUrl: photo, timezone: "Africa/Lagos" as const, cutoffAt: new Date(cutoffAt).toISOString(), fulfillmentDate, fulfillmentWindow, status: "open" as const, capacity, remainingCapacity: capacity, items: [{ dishId: ids.dishId, offerId: ids.offerId, quantityLimit }] } : undefined;
    const offer = orderingMode === "immediate" ? { id: ids.offerId, dishId: ids.dishId, vendorId, orderingMode: "immediate" as const, price: ngn(price), availability: { status: "available_now" as const, preparationEstimate: preparation }, availableFulfillment: ["delivery", "pickup"] as const } : { id: ids.offerId, dishId: ids.dishId, vendorId, orderingMode: "meal_drop" as const, mealDropId: ids.mealDropId, price: ngn(price), availability: { status: "preorder" as const, cutoffAt: drop!.cutoffAt, fulfillmentWindow }, availableFulfillment: ["delivery", "pickup"] as const };
    preview.addItem({ dish: { id: ids.dishId, vendorId, name, slug: `preview-dish-${seqRef.current}`, description, category, imageUrl: photo, imageUrls: photos, allergens, optionGroups }, offer, dailyLimit, remainingToday: dailyLimit, archived: false }, drop);
    setAddError("");
    setAddOptionGroups([]);
    setAddPhotoUrls([]);
    setFeedback(`${name} was added to this frontend preview only.`);
    setAddOpen(false);
  };

  const saveEditDish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const price = Number(form.get("price"));
    if (name.length < 2 || !Number.isFinite(price) || price <= 0) return;
    const category = String(form.get("category") ?? editing.category).trim() || editing.category;
    const description =
      String(form.get("description") ?? editing.description).trim() || editing.description;
    const preparation =
      String(form.get("preparation") ?? editing.preparationEstimate).trim() ||
      editing.preparationEstimate;
    const dailyLimit = Math.max(
      1,
      Number(form.get("dailyLimit") ?? editing.dailyLimit) || editing.dailyLimit,
    );
    const imageUrl = String(form.get("imageUrl") ?? editing.imageUrl ?? "").trim();
    const allergens = String(form.get("allergens") ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    const optionGroups = normalizeOptionGroups(editing.optionGroups);

    preview.updateItem(editing.id, (item) => ({ ...item, dish: { ...item.dish, name, description, category, imageUrl: imageUrl || item.dish.imageUrl, allergens, optionGroups }, offer: item.offer.orderingMode === "immediate" ? { ...item.offer, price: ngn(price), availability: item.offer.availability.status === "available_now" ? { ...item.offer.availability, preparationEstimate: preparation } : item.offer.availability } : { ...item.offer, price: ngn(price), availability: item.offer.availability.status === "preorder" ? { ...item.offer.availability, fulfillmentWindow: preparation } : item.offer.availability }, dailyLimit, remainingToday: Math.min(item.remainingToday, dailyLimit) }));
    setFeedback(`${name} updated in this frontend preview only.`);
    setEditing(null);
  };

  const immediateItems = items.filter((item) => item.orderingMode === "immediate");
  const mealDropItems = items.filter((item) => item.orderingMode === "meal_drop");

  return (
    <div className={styles.menuPage}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Menu &amp; availability</p>
          <h1>Menu and dishes</h1>
          <p>
            Manage reusable dishes, proteins, extras, stock limits, and ordering hours. Changes update this preview locally.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setAddError("");
            setAddOptionGroups([]);
            setAddPhotoUrls([]);
            setAddOpen(true);
          }}
        >
          <Plus aria-hidden="true" />
          Add dish
        </Button>
      </header>

      {feedback ? (
        <p className={styles.feedback} role="status">
          {feedback}
        </p>
      ) : null}

      <div className={styles.tabs} role="tablist" aria-label="Menu sections">
        {(
          [
            { id: "all", label: `All dishes (${items.length})` },
            { id: "immediate", label: `Immediate (${immediateItems.length})` },
            { id: "meal_drop", label: `Pre-order Batches (${mealDropItems.length})` },
            { id: "hours", label: "Ordering hours" },
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

      {tab === "hours" ? (
        <section className={`card ${styles.prepCard}`} aria-label="Operating and ordering hours">
          <div className="split">
            <div>
              <h2>Weekly ordering hours</h2>
              <p className="vendor-muted">
                Customers can only place immediate orders during active acceptance windows.
              </p>
            </div>
            <Clock3 aria-hidden="true" size={20} />
          </div>
          <div className={styles.hoursList}>
            {schedule.weeklyHours.map((entry) => (
              <div className={styles.hoursRow} key={entry.day}>
                <strong>{entry.day}</strong>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    aria-label={`${entry.day} accepting orders`}
                    checked={entry.open}
                    onChange={() =>
                      preview.updateSchedule((current) => ({
                        ...current,
                        weeklyHours: current.weeklyHours.map((item) =>
                          item.day === entry.day ? { ...item, open: !item.open } : item,
                        ),
                      }))
                    }
                  />
                  <span>{entry.open ? "Open" : "Closed"}</span>
                </label>
                <input
                  type="time"
                  aria-label={`${entry.day} opening time`}
                  disabled={!entry.open}
                  value={entry.openTime}
                  onChange={(event) =>
                    preview.updateSchedule((current) => ({
                      ...current,
                      weeklyHours: current.weeklyHours.map((item) =>
                        item.day === entry.day ? { ...item, openTime: event.target.value } : item,
                      ),
                    }))
                  }
                />
                <input
                  type="time"
                  aria-label={`${entry.day} closing time`}
                  disabled={!entry.open}
                  value={entry.closeTime}
                  onChange={(event) =>
                    preview.updateSchedule((current) => ({
                      ...current,
                      weeklyHours: current.weeklyHours.map((item) =>
                        item.day === entry.day ? { ...item, closeTime: event.target.value } : item,
                      ),
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <div className={styles.menuFormGrid}>
            <label className={styles.field}>
              <span>Max simultaneous immediate orders</span>
              <input
                type="number"
                min={1}
                value={schedule.maxSimultaneousOrders}
                onChange={(event) =>
                  preview.updateSchedule((current) => ({
                    ...current,
                    maxSimultaneousOrders: Math.max(1, Number(event.target.value) || 1),
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              <span>Special holiday / closure note</span>
              <input
                placeholder="e.g. Closed Dec 25"
                value={schedule.specialClosureNote}
                onChange={(event) =>
                  preview.updateSchedule((current) => ({ ...current, specialClosureNote: event.target.value }))
                }
              />
            </label>
          </div>
          <div className={styles.menuFormGrid}>
            <label className={styles.switch}>
              <input type="checkbox" checked={schedule.pauseImmediate} onChange={(event) => preview.updateSchedule((current) => ({ ...current, pauseImmediate: event.target.checked }))} />
              <span>Pause immediate orders</span>
            </label>
            <label className={styles.switch}>
              <input type="checkbox" checked={schedule.pausePreorders} onChange={(event) => preview.updateSchedule((current) => ({ ...current, pausePreorders: event.target.checked }))} />
              <span>Pause pre-order batch orders</span>
            </label>
          </div>
          <Button
            size="sm"
            type="button"
            onClick={() => setFeedback("Ordering hours saved locally in this frontend preview.")}
          >
            Save hours preview
          </Button>
        </section>
      ) : (
        <div className="stack-lg">
          {tab === "all" || tab === "immediate" ? (
            <section className={styles.menuList} aria-label="Immediate menu dishes">
              {immediateItems.map((item) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  isAvailable={preview.items.find((entry) => entry.offer.id === item.id)?.offer.availability.status !== "unavailable" && !preview.items.find((entry) => entry.offer.id === item.id)?.archived && (preview.items.find((entry) => entry.offer.id === item.id)?.remainingToday ?? 0) > 0}
                  onToggle={() => toggleAvailability(item.id, item.name)}
                  onEdit={() => setEditing(item)}
                  onArchive={() => { preview.archiveItem(item.id); setFeedback(`${item.name} archived in this frontend preview.`); }}
                  onDuplicate={() => { preview.duplicateItem(item.id); setFeedback(`${item.name} duplicated as a paused preview dish.`); }}
                  remainingToday={preview.items.find((entry) => entry.offer.id === item.id)?.remainingToday ?? 0}
                  onAdjustRemaining={(delta) => preview.updateItem(item.id, (entry) => ({ ...entry, remainingToday: Math.max(0, Math.min(entry.dailyLimit, entry.remainingToday + delta)) }))}
                />
              ))}
            </section>
          ) : null}

          {tab === "all" || tab === "meal_drop" ? (
            <section className="stack" aria-label="Scheduled pre-order batch dishes">
              <div className="split">
                <h2 style={{ fontSize: "1.05rem", margin: 0 }}>Scheduled pre-order batch dishes</h2>
                <span className={styles.previewPill}>Linked to pre-order batches</span>
              </div>
              <div className={styles.menuList}>
                {mealDropItems.map((item) => (
                  <MenuRow
                    key={item.id}
                    item={item}
                  isAvailable={preview.items.find((entry) => entry.offer.id === item.id)?.offer.availability.status !== "unavailable" && !preview.items.find((entry) => entry.offer.id === item.id)?.archived && (preview.items.find((entry) => entry.offer.id === item.id)?.remainingToday ?? 0) > 0}
                    onToggle={() => toggleAvailability(item.id, item.name)}
                  onEdit={() => setEditing(item)}
                  onArchive={() => { preview.archiveItem(item.id); setFeedback(`${item.name} archived in this frontend preview.`); }}
                  onDuplicate={() => { preview.duplicateItem(item.id); setFeedback(`${item.name} duplicated as a paused preview dish.`); }}
                  remainingToday={preview.items.find((entry) => entry.offer.id === item.id)?.remainingToday ?? 0}
                  onAdjustRemaining={(delta) => preview.updateItem(item.id, (entry) => ({ ...entry, remainingToday: Math.max(0, Math.min(entry.dailyLimit, entry.remainingToday + delta)) }))}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}

      <AddDishDialog
        open={addOpen}
        error={addError}
        photoUrls={addPhotoUrls}
        optionGroups={addOptionGroups}
        onOptionGroupsChange={setAddOptionGroups}
        onPhotoUrlsChange={setAddPhotoUrls}
        onOpenChange={setAddOpen}
        onSubmit={createDish}
      />

      <Dialog.Root open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.menuDialogBackdrop} />
          {editing ? (
            <Dialog.Content className={styles.menuDialog} aria-modal="true">
              <header>
                <div>
                  <p className={styles.eyebrow}>Edit dish &amp; modifiers</p>
                  <Dialog.Title>{editing.name}</Dialog.Title>
                  <Dialog.Description>
                    Add or edit proteins, portions, extras, and stock status in this frontend preview.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className={styles.close} type="button" aria-label="Close edit dish">
                    <X aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </header>
              <form onSubmit={saveEditDish}>
                <label>
                  Dish name
                  <input name="name" defaultValue={editing.name} required />
                </label>
                <label>
                  Description
                  <textarea name="description" defaultValue={editing.description} />
                </label>
                <div className={styles.menuFormGrid}>
                  <label>
                    Category
                    <input name="category" defaultValue={editing.category} />
                  </label>
                  <label>
                    Price (₦)
                    <input name="price" type="number" min={1} defaultValue={editing.price.amount} required />
                  </label>
                </div>
                <div className={styles.menuFormGrid}>
                  <label>
                    Preparation / window
                    <input name="preparation" defaultValue={editing.preparationEstimate} />
                  </label>
                  <label>
                    Daily quantity limit
                    <input name="dailyLimit" type="number" min={1} defaultValue={editing.dailyLimit} />
                  </label>
                </div>
                <div className={styles.menuFormGrid}>
                  <label>
                    Preview photo
                    <select name="imageUrl" defaultValue={editing.imageUrl ?? ""}>
                      {previewPhotos.map((photo) => (
                        <option key={photo.label} value={photo.value}>
                          {photo.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Allergens (comma-separated)
                    <input
                      name="allergens"
                      defaultValue={editing.allergens.join(", ")}
                      placeholder="e.g. Peanuts, Shellfish"
                    />
                  </label>
                </div>

                <DishOptionsEditor
                  groups={editing.optionGroups}
                  onChange={(nextGroups) => setEditing({ ...editing, optionGroups: nextGroups })}
                />

                <footer>
                  <Button type="submit" block>
                    Save dish preview
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

function MenuRow({
  item,
  isAvailable,
  onToggle,
  onEdit,
  onArchive,
  onDuplicate,
  onAdjustRemaining,
  remainingToday,
}: Readonly<{
  item: EditableDishItem;
  isAvailable: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onAdjustRemaining: (delta: number) => void;
  remainingToday: number;
}>) {
  const proteinCount = item.optionGroups.find((g) => g.id === "protein")?.choices.length ?? 0;
  const extrasCount = item.optionGroups.find((g) => g.id === "extras")?.choices.length ?? 0;
  const totalModifiers = item.optionGroups.reduce((sum, group) => sum + group.choices.length, 0);

  const modifierSummary =
    proteinCount || extrasCount
      ? [
          proteinCount ? `${proteinCount} protein${proteinCount === 1 ? "" : "s"}` : "",
          extrasCount ? `${extrasCount} extra${extrasCount === 1 ? "" : "s"}` : "",
        ]
          .filter(Boolean)
          .join(" · ")
      : totalModifiers > 0
        ? `${totalModifiers} options`
        : "";

  return (
    <article className={`card ${styles.menuRow}`}>
      {item.imageUrl ? (
        <Image src={item.imageUrl} alt={item.name} width={128} height={112} />
      ) : (
        <div className={styles.menuImagePlaceholder} aria-hidden="true">
          <UtensilsCrossed />
        </div>
      )}
      <div className={styles.menuInfo}>
        <div className="cluster">
          <Status tone={isAvailable ? "success" : "neutral"}>
            {isAvailable ? (item.orderingMode === "meal_drop" ? "Pre-order active" : "Available now") : "Paused"}
          </Status>
          <span className={styles.reference}>{item.category}</span>
          {modifierSummary ? <span className={styles.previewPill}>{modifierSummary}</span> : null}
          {item.preview ? <span className={styles.previewPill}>Preview dish</span> : null}
        </div>
        <h2>{item.name}</h2>
        <p>
          {formatMoney(item.price)} · {item.preparationEstimate} · {remainingToday}/{item.dailyLimit} remaining today
        </p>
      </div>
      <div className={styles.menuControls}>
        <Button size="sm" variant="secondary" type="button" onClick={onEdit}>
          <Edit3 aria-hidden="true" size={14} />
          Edit
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onDuplicate}>
          <Copy aria-hidden="true" size={14} /> Duplicate
        </Button>
        <label className={styles.switch}>
          <input
            aria-label={`Set ${item.name} availability`}
            type="checkbox"
            checked={isAvailable}
            onChange={onToggle}
          />
          <span>{isAvailable ? "Available" : "Paused"}</span>
        </label>
        <div className="cluster" aria-label={`${item.name} remaining portions`}>
          <Button size="sm" variant="secondary" type="button" aria-label={`Reduce ${item.name} remaining portions`} onClick={() => onAdjustRemaining(-1)} disabled={remainingToday === 0}><Minus aria-hidden="true" size={13} /></Button>
          <span className={styles.reference}>{remainingToday} left</span>
          <Button size="sm" variant="secondary" type="button" aria-label={`Increase ${item.name} remaining portions`} onClick={() => onAdjustRemaining(1)} disabled={remainingToday >= item.dailyLimit}><Plus aria-hidden="true" size={13} /></Button>
        </div>
        <Button size="sm" variant="ghost" type="button" onClick={onArchive}>
          <Trash2 aria-hidden="true" size={14} /> Archive
        </Button>
      </div>
    </article>
  );
}

function AddDishDialog({
  open,
  error,
  photoUrls,
  optionGroups,
  onOptionGroupsChange,
  onPhotoUrlsChange,
  onOpenChange,
  onSubmit,
}: Readonly<{
  open: boolean;
  error: string;
  photoUrls: readonly string[];
  optionGroups: readonly DishOptionGroup[];
  onOptionGroupsChange: (next: DishOptionGroup[]) => void;
  onPhotoUrlsChange: (next: readonly string[]) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}>) {
  const [customCategory, setCustomCategory] = useState(false);
  const [orderingMode, setOrderingMode] = useState<"immediate" | "meal_drop">("immediate");
  const [photoError, setPhotoError] = useState("");

  const addPhotos = async (files: FileList | null) => {
    const selected = Array.from(files ?? []);
    if (!selected.length) return;
    if (photoUrls.length + selected.length > 4) { setPhotoError("Choose up to four dish photos."); return; }
    if (selected.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) { setPhotoError("Choose JPEG, PNG, or WebP images only."); return; }
    if (selected.some((file) => file.size > 5 * 1024 * 1024)) { setPhotoError("Each dish photo must be 5 MB or smaller."); return; }
    try {
      const previews = await Promise.all(selected.map(readImageFile));
      onPhotoUrlsChange([...photoUrls, ...previews]);
      setPhotoError("");
    } catch {
      setPhotoError("We could not read one of those photos. Try another image.");
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setCustomCategory(false);
          setOrderingMode("immediate");
          setPhotoError("");
          onPhotoUrlsChange([]);
        }
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.menuDialogBackdrop} />
        <Dialog.Content className={styles.menuDialog} aria-modal="true">
          <header>
            <div>
              <p className={styles.eyebrow}>Menu preview</p>
              <Dialog.Title>Add a dish</Dialog.Title>
              <Dialog.Description>
                Configure base price, proteins, portions, and optional extras. Saved in this preview only.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className={styles.close} type="button" aria-label="Close add dish">
                <X aria-hidden="true" />
              </button>
            </Dialog.Close>
          </header>
          <form onSubmit={onSubmit} noValidate>
            {error ? (
              <p className={styles.errorBanner} role="alert">
                {error}
              </p>
            ) : null}
            <label>
              Dish name
              <input name="name" required placeholder="e.g. Pepper soup" />
            </label>
            <label>
              Description
              <textarea name="description" placeholder="Short description, portion note, or preparation style" />
            </label>
            <div className={styles.menuFormGrid}>
              <label>
                Category
                <select
                  name="category"
                  defaultValue="Kitchen special"
                  aria-describedby="category-help"
                  onChange={(event) => setCustomCategory(event.target.value === "other")}
                >
                  {menuCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="other">Other / custom category</option>
                </select>
                <small id="category-help">Customers use this to browse your menu.</small>
              </label>
              {customCategory ? (
                <label>
                  Custom category
                  <input name="customCategory" required placeholder="e.g. Family trays" />
                </label>
              ) : null}
              <label>
                Ordering model
                <select
                  name="orderingMode"
                  value={orderingMode}
                  aria-describedby="ordering-model-help"
                  onChange={(event) => setOrderingMode(event.target.value === "meal_drop" ? "meal_drop" : "immediate")}
                >
                  <option value="immediate">Order now — active menu</option>
                  <option value="meal_drop">Pre-order — scheduled batch</option>
                </select>
                <small id="ordering-model-help">
                  {orderingMode === "immediate"
                    ? "Customers order while your kitchen is open. You prepare each order as it comes in."
                    : "Customers reserve before a cutoff. You prepare and fulfill on a scheduled date."}
                </small>
              </label>
            </div>
            {orderingMode === "meal_drop" ? (
              <section className="stack" aria-label="Pre-order schedule">
                <p className={styles.previewPill}>Pre-order schedule</p>
                <div className={styles.menuFormGrid}>
                  <label>Cutoff date &amp; time<input name="cutoffAt" type="datetime-local" required /></label>
                  <label>Fulfillment date<input name="fulfillmentDate" type="date" required /></label>
                </div>
                <div className={styles.menuFormGrid}>
                  <label>Fulfillment window<input name="fulfillmentWindow" placeholder="e.g. Sunday, 1:00–4:00 PM" required /></label>
                  <label>Batch capacity<input name="capacity" type="number" min="1" placeholder="40" required /></label>
                </div>
                <label>Per-customer quantity limit<input name="quantityLimit" type="number" min="1" placeholder="4" required /></label>
              </section>
            ) : null}
            <div className={styles.menuFormGrid}>
              <label>
                Price (₦)
                <input name="price" required min="1" type="number" inputMode="numeric" placeholder="0" />
              </label>
              <label>
                Preparation time
                <input name="preparation" defaultValue="25–35 min" />
              </label>
            </div>
            <div className={styles.menuFormGrid}>
              <label>
                Daily quantity limit
                <input name="dailyLimit" type="number" min="1" defaultValue="25" />
              </label>
            </div>
            <fieldset className={styles.dishPhotoUpload}>
              <legend>Dish photos</legend>
              <p>Add up to four photos. The first is the cover; the rest can be used in a photo carousel post.</p>
              <label className={styles.photoPicker}>
                <span>Choose dish photos</span>
                <input aria-label="Choose dish photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void addPhotos(event.target.files)} />
              </label>
              {photoError ? <p className={styles.photoError} role="alert">{photoError}</p> : null}
              {photoUrls.length ? <div className={styles.dishPhotoList} aria-label="Selected dish photos">{photoUrls.map((url, index) => <div className={styles.dishPhotoPreview} key={url}><Image src={url} alt={`Selected dish photo ${index + 1}`} width={88} height={66} unoptimized/><button type="button" aria-label={`Remove dish photo ${index + 1}`} onClick={() => onPhotoUrlsChange(photoUrls.filter((_, position) => position !== index))}><X aria-hidden="true" size={14}/></button>{index === 0 ? <span>Cover</span> : null}</div>)}</div> : <p className={styles.photoHelp}>If you continue without a photo, the dish will show a neutral placeholder. Files stay only in this browser preview.</p>}
            </fieldset>
            <label>
              Allergens (comma-separated)
              <input name="allergens" placeholder="e.g. Fish, Melon seed" />
            </label>

            <DishOptionsEditor groups={optionGroups} onChange={onOptionGroupsChange} />

            <footer>
              <Button type="submit" block>
                Add to preview menu
              </Button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
