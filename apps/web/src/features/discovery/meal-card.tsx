"use client";

import type { Dish, MenuOffer, Vendor } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import Image from "next/image";
import Link from "next/link";
import { Status } from "@/components/ui/status";
import styles from "./discovery.module.css";
import { isCutoffPassed } from "@/features/meal-drops/effective-availability";
import { isImmediateOrderingOpen, useMenuPreview } from "@/lib/menu-preview-context";

export function MealCard({ dish, now, offer, vendor }: Readonly<{ dish: Dish; now?: string; offer: MenuOffer; vendor?: Vendor }>) {
  const { items, schedule } = useMenuPreview();
  const preview = items.find((item) => item.offer.id === offer.id || item.dish.id === dish.id);
  const currentDish = preview?.dish ?? dish;
  const currentOffer = preview?.offer ?? offer;
  const preorder = currentOffer.orderingMode === "meal_drop";
  const cutoffPassed = currentOffer.availability.status === "preorder" && Boolean(now) && isCutoffPassed(currentOffer.availability.cutoffAt, now!);
  const immediateClosed = currentOffer.orderingMode === "immediate" && !isImmediateOrderingOpen(schedule);
  const unavailable = Boolean(preview?.archived) || preview?.remainingToday === 0 || immediateClosed || cutoffPassed || currentOffer.availability.status === "unavailable";
  const href = preorder && currentOffer.mealDropId ? `/drops/${currentOffer.mealDropId}` : `/dishes/${currentDish.id}`;
  return (
    <article className={styles.dishCard}>
      <Link href={href}>
        <Image src={currentDish.imageUrl} alt={currentDish.name} width={720} height={540} sizes="(max-width: 600px) 50vw, 33vw" />
        <div className={styles.dishBody}>
          <h3>{currentDish.name}</h3>
          <p>{vendor ? `${vendor.name} · ` : ""}{currentOffer.availability.status === "available_now" ? currentOffer.availability.preparationEstimate : currentOffer.availability.status === "preorder" ? currentOffer.availability.fulfillmentWindow : currentOffer.availability.reason}</p>
          <div className={styles.split}>
            <strong className={styles.price}>{formatMoney(currentOffer.price)}</strong>
            <Status tone={preorder && !cutoffPassed ? "warning" : unavailable ? "neutral" : "success"}>
              {preview?.archived ? "Archived" : preview?.remainingToday === 0 ? "Sold out" : immediateClosed ? "Ordering closed" : cutoffPassed ? "Cutoff passed" : preorder ? "Pre-order" : currentOffer.availability.status === "unavailable" ? "Unavailable" : "Available now"}
            </Status>
          </div>
        </div>
      </Link>
    </article>
  );
}
