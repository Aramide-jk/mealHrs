"use client";

import type { DeliveryEligibility, Dish, MenuOffer, Vendor } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import styles from "../discovery/discovery.module.css";
import { addCartItem } from "@/features/cart/cart-store";
import { isCutoffPassed } from "@/features/meal-drops/effective-availability";
import { isImmediateOrderingOpen, useMenuPreview } from "@/lib/menu-preview-context";
import { useDeliveryPreview } from "@/lib/delivery-preview-context";

export function DishControls({ areaName = "your area", dish, eligibility: initialEligibility, now, offer, vendor }: Readonly<{ areaName?: string; dish: Dish; eligibility: DeliveryEligibility; now?: string; offer: MenuOffer; vendor: Vendor }>) {
  const { items, schedule } = useMenuPreview();
  const deliveryPreview = useDeliveryPreview();
  const preview = items.find((item) => item.offer.id === offer.id || item.dish.id === dish.id);
  const currentDish = preview?.dish ?? dish;
  const currentOffer = preview?.offer ?? offer;
  const eligibility = deliveryPreview.resolve(vendor.id, initialEligibility.areaId, currentOffer.orderingMode)?.eligibility ?? initialEligibility;
  const immediateClosed = currentOffer.orderingMode === "immediate" && !isImmediateOrderingOpen(schedule);
  const remainingToday = preview?.remainingToday ?? Number.POSITIVE_INFINITY;
  const [quantity,setQuantity] = useState(1);
  const [instructions,setInstructions] = useState("");
  const [selections,setSelections] = useState<Record<string,readonly string[]>>(() => Object.fromEntries(dish.optionGroups.map(group => [group.id, group.required && group.choices[0] ? [group.choices[0].id] : []])));
  const cutoffPassed = currentOffer.availability.status === "preorder" && Boolean(now) && isCutoffPassed(currentOffer.availability.cutoffAt, now!);
  const unavailable = Boolean(preview?.archived) || immediateClosed || remainingToday < 1 || cutoffPassed || currentOffer.availability.status === "unavailable" || eligibility.status === "outside_area" || eligibility.status === "delivery_paused" || (eligibility.status === "pickup_only" && !currentOffer.availableFulfillment.includes("pickup"));
  const total = currentOffer.price.amount + currentDish.optionGroups.flatMap((group) => group.choices).filter((choice) => Object.values(selections).flat().includes(choice.id)).reduce((sum, choice) => sum + choice.priceDelta.amount, 0);
  const timing = currentOffer.availability.status === "available_now" ? currentOffer.availability.preparationEstimate : currentOffer.availability.status === "preorder" ? currentOffer.availability.fulfillmentWindow : currentOffer.availability.reason;
  const eligibilityText = eligibility.status === "eligible" ? `Delivers to ${areaName} · ${eligibility.estimate}` : eligibility.status === "pickup_only" ? `${eligibility.reason} ${eligibility.pickupWindow}` : eligibility.reason;
  const toggle = (groupId:string,choiceId:string,multiple:boolean) => setSelections(current => ({...current,[groupId]:multiple ? (current[groupId]?.includes(choiceId) ? current[groupId]?.filter(id=>id!==choiceId) ?? [] : [...(current[groupId]??[]),choiceId]) : [choiceId]}));
  return <div className={`${styles.detailPanel} ${styles.stack}`}>
    <div><Status tone={currentOffer.availability.status === "preorder" && !cutoffPassed ? "warning" : unavailable ? "neutral" : "success"}>{preview?.archived ? "Archived" : remainingToday < 1 ? "Sold out" : immediateClosed ? "Ordering closed" : cutoffPassed ? "Cutoff passed" : currentOffer.availability.status === "available_now" ? "Available now" : currentOffer.availability.status === "preorder" ? "Pre-order" : "Unavailable"}</Status><h1>{currentDish.name}</h1><p className={styles.small}><Link href={`/k/${vendor.slug}`}>{vendor.name}</Link> · {vendor.rating} verified rating</p><p>{currentDish.description}</p></div>
    <div className={styles.detailFacts}><div className={styles.fact}><small>{currentOffer.orderingMode === "immediate" ? "Preparation" : "Fulfillment"}</small><strong>{timing}</strong></div><div className={styles.fact}><small>{eligibility.status === "pickup_only" ? "Pickup" : "Delivery"}</small><strong>{eligibility.status === "eligible" ? formatMoney(eligibility.deliveryFee) : eligibility.status === "pickup_only" ? "Pickup only" : "Unavailable"}</strong></div><div className={styles.fact}><small>Ordering</small><strong>{currentOffer.orderingMode === "immediate" ? "Order now" : "Pre-order"}</strong></div></div>
    <div className={`${styles.notice} ${unavailable ? styles.noticeWarning : ""}`} role="status">{preview?.archived ? "This dish has been archived by the kitchen." : immediateClosed ? schedule.specialClosureNote || "The kitchen is closed for immediate orders right now." : remainingToday < 1 ? "This dish is sold out for today." : eligibilityText}</div>
    {Number.isFinite(remainingToday) ? <p className={styles.small}><strong>{remainingToday}</strong> portions remain in this frontend preview today.</p> : null}
    {currentDish.optionGroups.map(group=><fieldset className={styles.stack} style={{border:0,padding:0}} key={group.id} disabled={unavailable}><legend className={styles.small}>{group.name} · {group.required ? "Required" : "Optional"}</legend>{group.choices.map(choice=><label className={styles.choice} key={choice.id}><input type={group.selection === "single" ? "radio" : "checkbox"} name={`dish-${group.id}`} checked={selections[group.id]?.includes(choice.id) ?? false} disabled={!choice.available} onChange={()=>toggle(group.id,choice.id,group.selection === "multiple")}/><span><strong>{choice.name}</strong><small>{choice.priceDelta.amount ? `+ ${formatMoney(choice.priceDelta)}` : "Included"}{!choice.available ? " · Unavailable" : ""}</small></span></label>)}</fieldset>)}
    {currentDish.allergens.length ? <p className={styles.small}><strong>Allergens:</strong> {currentDish.allergens.join(", ")}</p> : null}
    <label className={styles.field}><span>Special instructions</span><textarea className={styles.textarea} maxLength={300} placeholder="Optional note for the kitchen" value={instructions} onChange={event=>setInstructions(event.target.value)}/></label>
    <div className={styles.split}><div><small className={styles.muted}>Total</small><div className={styles.price}>{formatMoney({...currentOffer.price,amount:total*quantity})}</div></div><div className={styles.quantity}><button type="button" onClick={()=>setQuantity(Math.max(1,quantity-1))} aria-label="Decrease quantity"><Minus/></button><output>{quantity}</output><button type="button" disabled={quantity >= remainingToday} onClick={()=>setQuantity(Math.min(remainingToday,quantity+1))} aria-label="Increase quantity"><Plus/></button></div></div>
    <Button block disabled={unavailable} onClick={()=>{if(unavailable)return;const selectedOptions=currentDish.optionGroups.flatMap(group=>group.choices.filter(choice=>selections[group.id]?.includes(choice.id)).map(choice=>({name:group.name,value:choice.name,priceDelta:choice.priceDelta})));addCartItem({vendorId:vendor.id,orderingMode:currentOffer.orderingMode},{id:`${currentOffer.id}:${JSON.stringify(selections)}`,dishId:currentDish.id,offerId:currentOffer.id,name:currentDish.name,imageUrl:currentDish.imageUrl,unitPrice:currentOffer.price,quantity,selectedOptions,...(instructions.trim()?{instructions:instructions.trim()}:{})});}}>{unavailable ? "Currently unavailable" : currentOffer.orderingMode === "meal_drop" ? "Add pre-order" : "Add to order"}</Button>
  </div>;
}
