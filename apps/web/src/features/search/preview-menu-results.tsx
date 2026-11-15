"use client";

import type { MealListing } from "@mealhrs/contracts";
import { formatMoney } from "@mealhrs/domain";
import { Status } from "@/components/ui/status";
import { ResultRow } from "@/features/discovery/result-row";
import styles from "@/features/discovery/discovery.module.css";
import { isImmediateOrderingOpen, useMenuPreview } from "@/lib/menu-preview-context";

export function PreviewSearchMeals({ now, query, seed }: Readonly<{ now: string; query: string; seed: readonly MealListing[] }>) {
  const { items, schedule } = useMenuPreview();
  const normalized = query.trim().toLocaleLowerCase();
  const matching = (value: string) => !normalized || value.toLocaleLowerCase().includes(normalized);
  const seedByOffer = new Map(seed.map((entry) => [entry.offer.id, entry]));
  const vendorById = new Map(seed.map((entry) => [entry.vendor.id, entry.vendor]));
  const reconciled = items
    .filter((item) => item.offer.orderingMode === "immediate" && !item.archived)
    .filter((item) => matching(item.dish.name) || matching(item.dish.category))
    .flatMap((item) => {
      const existing = seedByOffer.get(item.offer.id);
      const vendor = existing?.vendor ?? vendorById.get(item.dish.vendorId);
      return vendor ? [{ dish: item.dish, offer: item.offer, vendor, remaining: item.remainingToday }] : [];
    });
  const previewOfferIds = new Set(items.map((item) => item.offer.id));
  const unchanged = seed.filter((entry) => !previewOfferIds.has(entry.offer.id) && entry.offer.orderingMode === "immediate" && (matching(entry.dish.name) || matching(entry.dish.category))).map((entry) => ({ ...entry, remaining: Number.POSITIVE_INFINITY }));
  const meals = [...reconciled, ...unchanged];
  const immediateOpen = isImmediateOrderingOpen(schedule, new Date(now));

  if (!meals.length) return <div className={styles.empty}><p>No meals matched this search.</p></div>;
  return <div className={styles.resultList}>{meals.map(({ dish, offer, remaining, vendor }) => {
    const unavailable = offer.availability.status === "unavailable" || remaining < 1 || !immediateOpen;
    const label = remaining < 1 ? "Sold out" : !immediateOpen ? "Ordering closed" : offer.availability.status === "unavailable" ? "Unavailable" : "Available now";
    return <ResultRow key={offer.id} href={`/dishes/${dish.id}`} imageUrl={dish.imageUrl} imageAlt={dish.name} title={dish.name} description={`${vendor.name} · ${vendor.publicArea}`} meta={<span className={styles.split}><Status tone={unavailable ? "neutral" : "success"}>{label}</Status><strong>{formatMoney(offer.price)}</strong></span>} />;
  })}</div>;
}
