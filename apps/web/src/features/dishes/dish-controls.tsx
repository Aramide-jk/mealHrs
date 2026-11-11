"use client";

import type { DeliveryEligibility, Dish, MenuOffer, Vendor } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import styles from "../discovery/discovery.module.css";
import { addCartItem } from "@/features/cart/cart-store";
import { isCutoffPassed } from "@/features/meal-drops/effective-availability";

export function DishControls({ areaName = "your area", dish, eligibility, now, offer, vendor }: Readonly<{ areaName?: string; dish: Dish; eligibility: DeliveryEligibility; now?: string; offer: MenuOffer; vendor: Vendor }>) {
  const [quantity,setQuantity] = useState(1);
  const [instructions,setInstructions] = useState("");
  const [selections,setSelections] = useState<Record<string,readonly string[]>>(() => Object.fromEntries(dish.optionGroups.map(group => [group.id, group.required && group.choices[0] ? [group.choices[0].id] : []])));
  const cutoffPassed = offer.availability.status === "preorder" && Boolean(now) && isCutoffPassed(offer.availability.cutoffAt, now!);
  const unavailable = cutoffPassed || offer.availability.status === "unavailable" || eligibility.status === "outside_area" || eligibility.status === "delivery_paused" || (eligibility.status === "pickup_only" && !offer.availableFulfillment.includes("pickup"));
  const total = useMemo(() => offer.price.amount + dish.optionGroups.flatMap(group => group.choices).filter(choice => Object.values(selections).flat().includes(choice.id)).reduce((sum,choice)=>sum+choice.priceDelta.amount,0),[dish.optionGroups,offer.price.amount,selections]);
  const timing = offer.availability.status === "available_now" ? offer.availability.preparationEstimate : offer.availability.status === "preorder" ? offer.availability.fulfillmentWindow : offer.availability.reason;
  const eligibilityText = eligibility.status === "eligible" ? `Delivers to ${areaName} · ${eligibility.estimate}` : eligibility.status === "pickup_only" ? `${eligibility.reason} ${eligibility.pickupWindow}` : eligibility.reason;
  const toggle = (groupId:string,choiceId:string,multiple:boolean) => setSelections(current => ({...current,[groupId]:multiple ? (current[groupId]?.includes(choiceId) ? current[groupId]?.filter(id=>id!==choiceId) ?? [] : [...(current[groupId]??[]),choiceId]) : [choiceId]}));
  return <div className={`${styles.detailPanel} ${styles.stack}`}>
    <div><Status tone={offer.availability.status === "preorder" && !cutoffPassed ? "warning" : unavailable ? "neutral" : "success"}>{cutoffPassed ? "Cutoff passed" : offer.availability.status === "available_now" ? "Available now" : offer.availability.status === "preorder" ? "Pre-order" : "Unavailable"}</Status><h1>{dish.name}</h1><p className={styles.small}><Link href={`/k/${vendor.slug}`}>{vendor.name}</Link> · {vendor.rating} verified rating</p><p>{dish.description}</p></div>
    <div className={styles.detailFacts}><div className={styles.fact}><small>{offer.orderingMode === "immediate" ? "Preparation" : "Fulfillment"}</small><strong>{timing}</strong></div><div className={styles.fact}><small>{eligibility.status === "pickup_only" ? "Pickup" : "Delivery"}</small><strong>{eligibility.status === "eligible" ? formatMoney(eligibility.deliveryFee) : eligibility.status === "pickup_only" ? "Pickup only" : "Unavailable"}</strong></div><div className={styles.fact}><small>Ordering</small><strong>{offer.orderingMode === "immediate" ? "Order now" : "Meal Drop"}</strong></div></div>
    <div className={`${styles.notice} ${unavailable ? styles.noticeWarning : ""}`} role="status">{eligibilityText}</div>
    {dish.optionGroups.map(group=><fieldset className={styles.stack} style={{border:0,padding:0}} key={group.id} disabled={unavailable}><legend className={styles.small}>{group.name} · {group.required ? "Required" : "Optional"}</legend>{group.choices.map(choice=><label className={styles.choice} key={choice.id}><input type={group.selection === "single" ? "radio" : "checkbox"} name={`dish-${group.id}`} checked={selections[group.id]?.includes(choice.id) ?? false} disabled={!choice.available} onChange={()=>toggle(group.id,choice.id,group.selection === "multiple")}/><span><strong>{choice.name}</strong><small>{choice.priceDelta.amount ? `+ ${formatMoney(choice.priceDelta)}` : "Included"}{!choice.available ? " · Unavailable" : ""}</small></span></label>)}</fieldset>)}
    {dish.allergens.length ? <p className={styles.small}><strong>Allergens:</strong> {dish.allergens.join(", ")}</p> : null}
    <label className={styles.field}><span>Special instructions</span><textarea className={styles.textarea} maxLength={300} placeholder="Optional note for the kitchen" value={instructions} onChange={event=>setInstructions(event.target.value)}/></label>
    <div className={styles.split}><div><small className={styles.muted}>Total</small><div className={styles.price}>{formatMoney({...offer.price,amount:total*quantity})}</div></div><div className={styles.quantity}><button type="button" onClick={()=>setQuantity(Math.max(1,quantity-1))} aria-label="Decrease quantity"><Minus/></button><output>{quantity}</output><button type="button" onClick={()=>setQuantity(quantity+1)} aria-label="Increase quantity"><Plus/></button></div></div>
    <Button block disabled={unavailable} onClick={()=>{if(unavailable)return;const selectedOptions=dish.optionGroups.flatMap(group=>group.choices.filter(choice=>selections[group.id]?.includes(choice.id)).map(choice=>({name:group.name,value:choice.name,priceDelta:choice.priceDelta})));addCartItem({vendorId:vendor.id,orderingMode:offer.orderingMode},{id:`${offer.id}:${JSON.stringify(selections)}`,dishId:dish.id,offerId:offer.id,name:dish.name,imageUrl:dish.imageUrl,unitPrice:offer.price,quantity,selectedOptions,...(instructions.trim()?{instructions:instructions.trim()}:{})});}}>{unavailable ? "Currently unavailable" : offer.orderingMode === "meal_drop" ? "Add pre-order" : "Add to order"}</Button>
  </div>;
}
