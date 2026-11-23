"use client";

import type { Dish, MenuOffer, Vendor } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import { Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Status } from "@/components/ui/status";
import styles from "./discovery.module.css";
import { isCutoffPassed } from "@/features/meal-drops/effective-availability";
import { getCutoffCountdown } from "@/features/meal-drops/cutoff-countdown";
import { isImmediateOrderingOpen, useMenuPreview } from "@/lib/menu-preview-context";
import { useCustomerActivity } from "@/lib/customer-activity-context";

export function MealCard({ dish, now, offer, vendor }: Readonly<{ dish: Dish; now?: string; offer: MenuOffer; vendor?: Vendor }>) {
  const { items, schedule } = useMenuPreview();
  const { isMealSaved, toggleSaveMeal } = useCustomerActivity();
  const preview = items.find((item) => item.offer.id === offer.id || item.dish.id === dish.id);
  const currentDish = preview?.dish ?? dish;
  const currentOffer = preview?.offer ?? offer;
  const saved = isMealSaved(currentDish.id) || isMealSaved(currentOffer.id);
  const preorder = currentOffer.orderingMode === "meal_drop";
  const cutoffCountdown = preorder && currentOffer.availability.status === "preorder"
    ? getCutoffCountdown(currentOffer.availability.cutoffAt, now)
    : null;
  const cutoffPassed = currentOffer.availability.status === "preorder" && (cutoffCountdown?.isPassed ?? (Boolean(now) && isCutoffPassed(currentOffer.availability.cutoffAt, now!)));
  const immediateClosed = currentOffer.orderingMode === "immediate" && !isImmediateOrderingOpen(schedule);
  const unavailable = Boolean(preview?.archived) || preview?.remainingToday === 0 || immediateClosed || cutoffPassed || currentOffer.availability.status === "unavailable";
  const href = preorder && currentOffer.mealDropId ? `/drops/${currentOffer.mealDropId}` : `/dishes/${currentDish.id}`;

  const handleToggleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveMeal(currentDish.id);
  };

  return (
    <article className={styles.dishCard}>
      <button
        type="button"
        className={`${styles.saveButton} ${saved ? styles.saveButtonActive : ""}`}
        onClick={handleToggleSave}
        aria-label={saved ? `Remove ${currentDish.name} from saved` : `Save ${currentDish.name} to collection`}
        aria-pressed={saved}
      >
        <Bookmark size={15} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      </button>
      <Link href={href}>
        <Image src={currentDish.imageUrl} alt={currentDish.name} width={720} height={540} sizes="(max-width: 600px) 50vw, 33vw" />
        <div className={styles.dishBody}>
          <h3>{currentDish.name}</h3>
          <p className={preorder ? styles.dishPreorder : undefined}>
            <span>{vendor ? `${vendor.name} · ` : ""}{currentOffer.availability.status === "available_now" ? currentOffer.availability.preparationEstimate : currentOffer.availability.status === "preorder" ? currentOffer.availability.fulfillmentWindow : currentOffer.availability.reason}</span>
            {cutoffCountdown && !cutoffPassed ? (
              <span className={`${styles.cutoffPill} ${cutoffCountdown.isUrgent ? styles.cutoffPillUrgent : ""}`}>
                ⏳ {cutoffCountdown.progressiveLabel}
              </span>
            ) : null}
          </p>
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
