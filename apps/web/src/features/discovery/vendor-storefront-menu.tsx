"use client";

import type { DeliveryEligibility, MealDrop, Vendor } from "@mealhrs/domain";
import type { MealListing } from "@mealhrs/contracts";
import Image from "next/image";
import Link from "next/link";
import { Status } from "@/components/ui/status";
import { isCutoffPassed } from "@/features/meal-drops/effective-availability";
import { getCutoffCountdown } from "@/features/meal-drops/cutoff-countdown";
import { useCustomerContext } from "@/lib/customer-context";
import { useDeliveryPreview } from "@/lib/delivery-preview-context";
import { isImmediateOrderingOpen, useMenuPreview } from "@/lib/menu-preview-context";
import { MealCard } from "./meal-card";
import styles from "./discovery.module.css";

export function VendorStorefrontMenu({ eligibility, initialDrops, initialMenu, now, vendor }: Readonly<{ eligibility: DeliveryEligibility; initialDrops: readonly MealDrop[]; initialMenu: readonly MealListing[]; now: string; vendor: Vendor }>) {
  const { items, mealDrops, schedule } = useMenuPreview();
  const { activeArea } = useCustomerContext();
  const deliveryPreview = useDeliveryPreview();
  const immediateEligibility = deliveryPreview.resolve(vendor.id, activeArea.id, "immediate")?.eligibility ?? eligibility;
  const preOrderEligibility = deliveryPreview.resolve(vendor.id, activeArea.id, "meal_drop")?.eligibility ?? eligibility;
  const previewMenu = items.filter((item) => item.dish.vendorId === vendor.id);
  const menu = previewMenu.length ? previewMenu.filter((item) => !item.archived) : initialMenu.map(({ dish, offer }) => ({ dish, offer, archived: false, dailyLimit: Number.POSITIVE_INFINITY, remainingToday: Number.POSITIVE_INFINITY }));
  const immediate = menu.filter((item) => item.offer.orderingMode === "immediate");
  const previewDrops = mealDrops.filter((drop) => drop.vendorId === vendor.id);
  const drops = previewDrops.length ? previewDrops : initialDrops;
  const immediateOpen = isImmediateOrderingOpen(schedule, new Date(now));

  return <>
    {immediate.length ? <section id="menu"><div className={styles.sectionTitle}><h2>Menu</h2><span>{immediate.length} meals</span></div>{!immediateOpen ? <p className={`${styles.notice} ${styles.noticeWarning}`}>{schedule.specialClosureNote || "Immediate ordering is closed right now. You can still browse the menu."}</p> : null}<div className={styles.dishGrid}>{immediate.map((item) => <MealCard key={item.offer.id} dish={item.dish} offer={item.offer} vendor={vendor} now={now} />)}</div></section> : null}
    {drops.length ? <section id="drops"><div className={styles.sectionTitle}><h2>Pre-orders</h2><span>{drops.length} batch{drops.length > 1 ? "es" : ""}</span></div><div className={styles.resultList}>{drops.map((drop) => { const expired = isCutoffPassed(drop.cutoffAt, now); const full = drop.remainingCapacity < 1; const countdown = getCutoffCountdown(drop.cutoffAt, now); return <Link className={styles.resultRow} href={`/drops/${drop.id}`} key={drop.id}><Image src={drop.imageUrl} alt={drop.name} width={180} height={150} /><span><h3>{drop.name}</h3><p>{drop.fulfillmentDate} · {drop.fulfillmentWindow} WAT · {drop.remainingCapacity}/{drop.capacity} places</p>{!expired && drop.status === "open" ? <p className={styles.dishPreorder}><span className={`${styles.cutoffPill} ${countdown.isUrgent ? styles.cutoffPillUrgent : ""}`}>⏳ {countdown.progressiveLabel}</span></p> : null}<Status tone={!expired && !full && drop.status === "open" ? "warning" : "neutral"}>{expired ? "Cutoff passed" : full ? "Sold out" : drop.status === "open" ? "Pre-order" : drop.status.replaceAll("_", " ")}</Status></span></Link>; })}</div></section> : null}
    {immediateEligibility.status !== "eligible" ? <p className={`${styles.notice} ${styles.noticeWarning}`}>{immediateEligibility.status === "pickup_only" ? `${immediateEligibility.reason} ${immediateEligibility.pickupWindow}` : immediateEligibility.reason}</p> : null}
    {preOrderEligibility.status !== "eligible" && preOrderEligibility.status !== immediateEligibility.status ? <p className={`${styles.notice} ${styles.noticeWarning}`}>{preOrderEligibility.status === "pickup_only" ? `Pre-orders: ${preOrderEligibility.reason} ${preOrderEligibility.pickupWindow}` : `Pre-orders: ${preOrderEligibility.reason}`}</p> : null}
  </>;
}
