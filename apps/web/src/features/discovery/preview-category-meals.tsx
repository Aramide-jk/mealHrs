"use client";

import type { MealListing } from "@mealhrs/contracts";
import { useMenuPreview } from "@/lib/menu-preview-context";
import { MealCard } from "./meal-card";
import styles from "./discovery.module.css";

export function PreviewCategoryMeals({ category, now, seed }: Readonly<{ category: string; now: string; seed: readonly MealListing[] }>) {
  const { items } = useMenuPreview();
  const seedByOffer = new Map(seed.map((entry) => [entry.offer.id, entry]));
  const vendorById = new Map(seed.map((entry) => [entry.vendor.id, entry.vendor]));
  const preview = items.filter((item) => !item.archived && item.dish.category === category).flatMap((item) => {
    const vendor = seedByOffer.get(item.offer.id)?.vendor ?? vendorById.get(item.dish.vendorId);
    return vendor ? [{ dish: item.dish, offer: item.offer, vendor }] : [];
  });
  const previewIds = new Set(items.map((item) => item.offer.id));
  const remaining = seed.filter((item) => !previewIds.has(item.offer.id) && item.dish.category === category);
  const meals = [...preview, ...remaining];
  if (!meals.length) return <div className={styles.empty} style={{ marginTop: 20 }}><div><h2>No meals in this category yet</h2><p>Check another category or return later.</p></div></div>;
  return <div className={styles.dishGrid} style={{ marginTop: 20 }}>{meals.map((item) => <MealCard key={item.offer.id} {...item} now={now} />)}</div>;
}
