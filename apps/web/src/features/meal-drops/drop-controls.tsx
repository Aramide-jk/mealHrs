"use client";

import type { DeliveryEligibility, Dish, MealDrop, MenuOffer, Vendor } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import styles from "../discovery/discovery.module.css";
import { addCartItem } from "@/features/cart/cart-store";
import { isCutoffPassed } from "./effective-availability";

export type DropSelection = Readonly<{ dish: Dish; offer: MenuOffer; quantityLimit: number }>;

export function DropControls({ areaName = "your area", eligibility, mealDrop, now, selections, vendor }: Readonly<{ areaName?: string; eligibility: DeliveryEligibility; mealDrop: MealDrop; now?: string; selections: readonly DropSelection[]; vendor: Vendor }>) {
  const [selectedId,setSelectedId]=useState(selections[0]?.offer.id ?? "");
  const selected=selections.find(item=>item.offer.id===selectedId) ?? selections[0];
  const cutoffPassed = now ? isCutoffPassed(mealDrop.cutoffAt, now) : mealDrop.status === "cutoff_passed";
  const closed=cutoffPassed || ["cutoff_passed","sold_out","cancelled"].includes(mealDrop.status) || mealDrop.remainingCapacity<=0;
  const pickupOnly=eligibility.status === "pickup_only";
  const outside=eligibility.status === "outside_area" || eligibility.status === "delivery_paused";
  const disabled=closed || outside || !selected;
  const statusLabel=cutoffPassed || mealDrop.status === "cutoff_passed" ? "Cutoff passed" : mealDrop.status === "sold_out" || mealDrop.remainingCapacity<=0 ? "Sold out" : mealDrop.status === "cancelled" ? "Cancelled" : "Pre-order";
  const eligibilityText=eligibility.status==="eligible"?`Delivery is available to ${areaName} · ${eligibility.estimate}`:eligibility.status==="pickup_only"?`${eligibility.reason} ${eligibility.pickupWindow}`:eligibility.reason;
  return <div className={`${styles.detailPanel} ${styles.stack}`}>
    <div><Status tone={closed ? "neutral" : "warning"}>{statusLabel}</Status><h1>{mealDrop.name}</h1><p className={styles.small}><Link href={`/k/${vendor.slug}`}>{vendor.name}</Link> · Dated Meal Drop</p><p>{mealDrop.description}</p></div>
    <div className={styles.dropBanner} role="status"><strong>Order cutoff: {new Intl.DateTimeFormat("en-NG",{dateStyle:"medium",timeStyle:"short",timeZone:mealDrop.timezone}).format(new Date(mealDrop.cutoffAt))} WAT</strong><br/>{mealDrop.fulfillmentDate} · {mealDrop.fulfillmentWindow} WAT · {mealDrop.remainingCapacity} of {mealDrop.capacity} spaces remain.</div>
    <div className={styles.detailFacts}><div className={styles.fact}><small>Fulfillment</small><strong>{mealDrop.fulfillmentDate}</strong></div><div className={styles.fact}><small>{pickupOnly?"Collection":"Delivery"}</small><strong>{pickupOnly?"Pickup only":outside?"Unavailable":areaName}</strong></div><div className={styles.fact}><small>Capacity</small><strong>{mealDrop.remainingCapacity}/{mealDrop.capacity}</strong></div></div>
    <div className={`${styles.notice} ${(closed||outside)?styles.noticeWarning:""}`}>{closed ? `Ordering is closed because this Meal Drop is ${statusLabel.toLowerCase()}.` : eligibilityText}</div>
    <fieldset className={styles.stack} style={{border:0,padding:0}} disabled={disabled}><legend className={styles.small}>Choose your meal</legend>{selections.map(item=><label className={styles.choice} key={item.offer.id}><input type="radio" name="drop-meal" checked={selectedId===item.offer.id} onChange={()=>setSelectedId(item.offer.id)}/><span><strong>{item.dish.name}</strong><small>{formatMoney(item.offer.price)} · Limit {item.quantityLimit}</small></span></label>)}</fieldset>
    <div className={`${styles.notice} ${styles.noticeWarning}`}>Immediate meals and this Meal Drop require separate orders because their fulfillment times differ.</div>
    <Button block disabled={disabled} onClick={()=>{if(!selected||disabled)return;addCartItem({vendorId:vendor.id,orderingMode:"meal_drop"},{id:selected.offer.id,dishId:selected.dish.id,offerId:selected.offer.id,name:selected.dish.name,imageUrl:selected.dish.imageUrl,unitPrice:selected.offer.price,quantity:1,selectedOptions:[]});}}>{disabled?closed?statusLabel:outside?"Outside delivery area":"Unavailable":<>{pickupOnly?"Add pickup pre-order":"Add pre-order"} · {selected?formatMoney(selected.offer.price):""}</>}</Button><p className={styles.muted} style={{fontSize:'.68rem'}}>Published Meal Drops remain visible after cutoff, but ordering closes automatically.</p>
  </div>;
}
