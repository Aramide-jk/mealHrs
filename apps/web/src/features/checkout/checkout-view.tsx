"use client";
import type { AreaId, Cart, CustomerAddress, DeliveryEligibility, Vendor } from "@mealhrs/domain";
import { formatMoney, ngn } from "@mealhrs/domain";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useCartStore } from "@/features/cart/cart-store";
import { cartSubtotal, SERVICE_FEE_NGN } from "@/features/cart/pricing";
import { isImmediateOrderingOpen, useMenuPreview } from "@/lib/menu-preview-context";
import { isCutoffPassed } from "@/features/meal-drops/effective-availability";
import { useDeliveryPreview } from "@/lib/delivery-preview-context";

type AreaOption = Readonly<{ id: AreaId; name: string }>;
type EligibilityOption = Readonly<{ vendorId: string; areaId: AreaId; eligibility: DeliveryEligibility }>;

export function CheckoutView({ activeAreaId, addresses, areas, eligibilities, seed, vendors }: { activeAreaId: AreaId; addresses: readonly CustomerAddress[]; areas: readonly AreaOption[]; eligibilities: readonly EligibilityOption[]; seed: Cart; vendors: readonly Vendor[] }) {
  const router = useRouter();
  const { cart, hydrateSeed, setPaymentPreview } = useCartStore();
  const { items: previewItems, mealDrops, schedule } = useMenuPreview();
  const deliveryPreview = useDeliveryPreview();
  useEffect(() => hydrateSeed(seed), [hydrateSeed, seed]);
  const currentCart = cart ?? seed;
  const vendor = vendors.find((item) => item.id === currentCart.vendorId) ?? vendors[0]!;
  const [areaId, setAreaId] = useState(activeAreaId);
  const [storedFulfillment, setFulfillment] = useState<"delivery" | "pickup">(vendor.fulfillmentModes[0] ?? "delivery");
  const [rechecked, setRechecked] = useState(false);
  const deliveryRules = deliveryPreview.resolve(vendor.id, areaId, currentCart.orderingMode);
  const eligibility = deliveryRules?.eligibility ?? eligibilities.find((item) => item.vendorId === vendor.id && item.areaId === areaId)?.eligibility;
  const fulfillmentModes = deliveryRules ? [
    ...(eligibility?.status === "eligible" ? ["delivery" as const] : []),
    ...(deliveryRules.pickup.mode !== "delivery" ? ["pickup" as const] : []),
  ] : vendor.fulfillmentModes;
  const fulfillment = fulfillmentModes.includes(storedFulfillment) ? storedFulfillment : (fulfillmentModes[0] ?? "delivery");
  const address = addresses.find((item) => item.areaId === areaId);
  const delivery = fulfillment === "delivery";
  const eligible = eligibility?.status === "eligible";
  const fee = delivery && eligibility?.status === "eligible" ? eligibility.deliveryFee.amount : 0;
  const subtotal = useMemo(() => cartSubtotal(currentCart), [currentCart]);
  const minimumOrderIssue = delivery && deliveryRules?.minimumOrder && subtotal < deliveryRules.minimumOrder.amount ? `Delivery to this area has a minimum order of ${formatMoney(deliveryRules.minimumOrder)}.` : null;
  const now = new Date().toISOString();
  const previewIssue = (offerId: string) => {
    const preview = previewItems.find((item) => item.offer.id === offerId);
    if (!preview || preview.archived || preview.offer.availability.status === "unavailable" || preview.remainingToday < 1) return "This meal is no longer available.";
    if (preview.offer.orderingMode === "immediate" && !isImmediateOrderingOpen(schedule)) return schedule.specialClosureNote || "Immediate ordering is closed right now.";
    if (preview.offer.orderingMode === "meal_drop") { const drop = mealDrops.find((entry) => entry.id === preview.offer.mealDropId); if (!drop || drop.remainingCapacity < 1 || drop.status !== "open" || isCutoffPassed(drop.cutoffAt, now)) return "This pre-order is no longer accepting orders."; }
    return null;
  };
  const menuIssues = currentCart.items.map((item) => ({ item, reason: previewIssue(item.offerId) })).filter((entry): entry is { item: typeof currentCart.items[number]; reason: string } => Boolean(entry.reason));
  const canSubmit = currentCart.items.length > 0 && menuIssues.length === 0 && !minimumOrderIssue && Boolean(fulfillmentModes.length) && (!delivery || Boolean(address && eligible));
  const total = subtotal + fee + SERVICE_FEE_NGN;
  const submitPreview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setPaymentPreview({ cart: currentCart, deliveryFee: fee, fulfillment, serviceFee: SERVICE_FEE_NGN, subtotal, total, vendorName: vendor.name });
    router.push("/checkout/payment-result");
  };
  return <div className="commerce-page"><header className="commerce-head"><p className="commerce-eyebrow">{vendor.name}</p><h1>Checkout</h1><p>Everything is revalidated before payment.</p></header><form className="commerce-grid" onSubmit={submitPreview}><div className="commerce-stack-lg">{menuIssues.length ? <Notice tone="warning">{menuIssues.map(({ item, reason }) => `${item.name}: ${reason}`).join(" ")} Return to your order to update it.</Notice> : null}{minimumOrderIssue ? <Notice tone="warning">{minimumOrderIssue}</Notice> : null}<section className="commerce-section commerce-stack"><h2>Fulfillment</h2>{fulfillmentModes.map((mode) => <label className="commerce-choice" key={mode}><input type="radio" name="fulfillment" checked={fulfillment === mode} onChange={() => setFulfillment(mode)}/><span><strong>{mode === "delivery" ? "Vendor delivery" : "Pickup"}</strong><small>{mode === "delivery" ? eligible && eligibility.status === "eligible" ? `${eligibility.estimate} · ${formatMoney(eligibility.deliveryFee)}` : "Unavailable for this area" : deliveryRules?.pickup.windowNote ? `Collect during ${deliveryRules.pickup.windowNote}` : "Collect from the kitchen during the confirmed window"}</small></span></label>)}</section>{delivery && <section className="commerce-section commerce-stack"><div className="commerce-section-title"><h2>Delivery address</h2><Link href="/profile/addresses">Manage</Link></div>{address && <div className="commerce-choice commerce-address"><MapPin size={17}/><span><strong>{address.label}</strong><small>{address.line1}, {address.areaName}</small></span></div>}<label className="commerce-field"><span>Preview address state</span><select className="commerce-input" value={areaId} onChange={(event) => setAreaId(event.target.value as AreaId)} aria-invalid={!eligible} aria-describedby={!eligible || !address ? "area-error" : "area-hint"}>{areas.map((option) => { const rules = deliveryPreview.resolve(vendor.id, option.id, currentCart.orderingMode); const optionEligibility = rules?.eligibility ?? eligibilities.find((item) => item.vendorId === vendor.id && item.areaId === option.id)?.eligibility; return <option key={option.id} value={option.id}>{optionEligibility?.status === "eligible" ? "Supported" : "Unsupported"} · {option.name}</option>; })}</select><small id="area-hint" className="commerce-hint">This previews a saved area; change your active area from the header.</small></label>{(!eligible || !address) && <div id="area-error" role="alert" className="notice notice--danger"><MapPin size={17}/><div><strong>Review your delivery address.</strong><br/>{!address ? "Add a delivery address in this area." : eligibility?.status === "outside_area" ? eligibility.reason : "Delivery is not available for this area."}</div></div>}</section>}<section className="commerce-section commerce-stack"><h2>{delivery ? "Delivery" : "Pickup"} instructions</h2><label className="commerce-field"><span>Optional note</span><textarea className="commerce-input commerce-textarea" placeholder="Landmark or preferred call instruction" maxLength={300}/></label></section><section className="commerce-section commerce-stack"><h2>Payment</h2><p className="commerce-hint">This frontend does not process a real payment.</p></section></div><aside className="commerce-section commerce-summary"><h2>Order review</h2>{rechecked ? <Notice tone="warning">The order has been rechecked. Review the total.</Notice> : <Notice tone="warning">Price, eligibility and capacity are rechecked before payment.</Notice>}{currentCart.items.map((item) => <article className="commerce-line" key={item.id}><Image src={item.imageUrl} alt={item.name} width={156} height={156}/><div><h3>{item.name}</h3><p>{item.selectedOptions.map((option) => option.value).join(" · ") || "No options selected"} · Qty {item.quantity}</p>{item.instructions && <p>Kitchen note: {item.instructions}</p>}</div><strong>{formatMoney(ngn((item.unitPrice.amount + item.selectedOptions.reduce((sum, option) => sum + option.priceDelta.amount, 0)) * item.quantity))}</strong></article>)}<div className="commerce-money"><div className="commerce-money-row"><span>Food</span><strong>{formatMoney(ngn(subtotal))}</strong></div><div className="commerce-money-row"><span>Delivery</span><strong>{formatMoney(ngn(fee))}</strong></div><div className="commerce-money-row"><span>Service charge</span><strong>{formatMoney(ngn(SERVICE_FEE_NGN))}</strong></div><div className="commerce-money-row commerce-total"><span>Pay now</span><strong>{formatMoney(ngn(total))}</strong></div></div><Button type="submit" block disabled={!canSubmit} aria-describedby={delivery && !canSubmit ? "area-error" : undefined}>{menuIssues.length ? "Review unavailable meals" : minimumOrderIssue ? "Add more to order" : "Continue to simulated payment"}</Button><Button type="button" variant="ghost" block onClick={() => setRechecked(true)}>Recheck order</Button></aside></form></div>;
}
