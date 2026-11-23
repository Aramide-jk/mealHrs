"use client";
import type { AreaId, Cart, CustomerAddress, DeliveryEligibility, Vendor } from "@mealhrs/domain";
import { formatMoney, ngn } from "@mealhrs/domain";
import { MapPin, Store } from "lucide-react";
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
import { useCustomerActivity } from "@/lib/customer-activity-context";
import { useAdminActivity } from "@/lib/admin-activity-context";

type AreaOption = Readonly<{ id: AreaId; name: string }>;
type EligibilityOption = Readonly<{ vendorId: string; areaId: AreaId; eligibility: DeliveryEligibility }>;

export function CheckoutView({ activeAreaId, addresses, areas, eligibilities, seed, vendors }: { activeAreaId: AreaId; addresses: readonly CustomerAddress[]; areas: readonly AreaOption[]; eligibilities: readonly EligibilityOption[]; seed: Cart; vendors: readonly Vendor[] }) {
  const router = useRouter();
  const { cart, hydrateSeed, setPaymentPreview } = useCartStore();
  const { items: previewItems, mealDrops, schedule } = useMenuPreview();
  const deliveryPreview = useDeliveryPreview();
  const { addresses: activityAddresses } = useCustomerActivity();
  const { emergencyKillSwitchEnabled, emergencyNotice } = useAdminActivity();
  const effectiveAddresses = activityAddresses.length > 0 ? activityAddresses : addresses;

  useEffect(() => hydrateSeed(seed), [hydrateSeed, seed]);
  const currentCart = cart ?? seed;
  const vendor = vendors.find((item) => item.id === currentCart.vendorId) ?? vendors[0]!;
  const [areaId, setAreaId] = useState(activeAreaId);
  const [storedFulfillment, setFulfillment] = useState<"delivery" | "pickup">(vendor.fulfillmentModes[0] ?? "delivery");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer" | "wallet">("bank_transfer");
  const [needCutlery, setNeedCutlery] = useState(false);
  const [tip, setTip] = useState(0);
  const [rechecked, setRechecked] = useState(false);
  const deliveryRules = deliveryPreview.resolve(vendor.id, areaId, currentCart.orderingMode);
  const eligibility = deliveryRules?.eligibility ?? eligibilities.find((item) => item.vendorId === vendor.id && item.areaId === areaId)?.eligibility;
  const fulfillmentModes = deliveryRules ? [
    ...(eligibility?.status === "eligible" ? ["delivery" as const] : []),
    ...(deliveryRules.pickup.mode !== "delivery" ? ["pickup" as const] : []),
  ] : vendor.fulfillmentModes;
  const fulfillment = fulfillmentModes.includes(storedFulfillment) ? storedFulfillment : (fulfillmentModes[0] ?? "delivery");
  const address = effectiveAddresses.find((item) => item.areaId === areaId);
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
  const emergencyIssue = emergencyKillSwitchEnabled && currentCart.orderingMode === "immediate" ? (emergencyNotice || "Immediate ordering is temporarily paused due to adverse conditions. Scheduled pre-orders remain active.") : null;
  const canSubmit = currentCart.items.length > 0 && menuIssues.length === 0 && !minimumOrderIssue && !emergencyIssue && Boolean(fulfillmentModes.length) && (!delivery || Boolean(address && eligible));
  const cutleryFee = needCutlery ? 100 : 0;
  const total = subtotal + fee + SERVICE_FEE_NGN + cutleryFee + tip;
  const submitPreview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const pickupDetails = fulfillment === "pickup" && deliveryRules?.pickup ? {
      address: deliveryRules.pickup.pickupAddress || `${vendor.name} Kitchen (${vendor.publicArea})`,
      landmark: deliveryRules.pickup.landmark,
      windowNote: deliveryRules.pickup.windowNote,
    } : undefined;
    setPaymentPreview({ cart: currentCart, deliveryFee: fee, fulfillment, serviceFee: SERVICE_FEE_NGN, subtotal, total, vendorName: vendor.name, pickupDetails, paymentMethod, cutlery: needCutlery, tip });
    router.push("/checkout/payment-result");
  };
  return <div className="commerce-page"><header className="commerce-head"><p className="commerce-eyebrow">{vendor.name}</p><h1>Checkout</h1><p>Everything is revalidated before payment.</p></header><form className="commerce-grid" onSubmit={submitPreview}><div className="commerce-stack-lg">{emergencyIssue ? <Notice tone="danger">{emergencyIssue}</Notice> : null}{menuIssues.length ? <Notice tone="warning">{menuIssues.map(({ item, reason }) => `${item.name}: ${reason}`).join(" ")} Return to your order to update it.</Notice> : null}{minimumOrderIssue ? <Notice tone="warning">{minimumOrderIssue}</Notice> : null}<section className="commerce-section commerce-stack"><h2>Fulfillment</h2>{fulfillmentModes.map((mode) => <label className="commerce-choice" key={mode}><input type="radio" name="fulfillment" checked={fulfillment === mode} onChange={() => setFulfillment(mode)}/><span><strong>{mode === "delivery" ? "Vendor delivery" : "Pickup"}</strong><small>{mode === "delivery" ? eligible && eligibility.status === "eligible" ? `${eligibility.estimate} · ${formatMoney(eligibility.deliveryFee)}` : "Unavailable for this area" : deliveryRules?.pickup.windowNote ? `Collect during ${deliveryRules.pickup.windowNote}` : "Collect from the kitchen during the confirmed window"}</small></span></label>)}</section>{delivery ? <section className="commerce-section commerce-stack"><div className="commerce-section-title"><h2>Delivery address</h2><Link href="/profile/addresses">Manage</Link></div>{address && <div className="commerce-choice commerce-address"><MapPin size={17}/><span><strong>{address.label}</strong><small>{address.line1}, {address.areaName}</small></span></div>}<label className="commerce-field"><span>Preview address state</span><select className="commerce-input" value={areaId} onChange={(event) => setAreaId(event.target.value as AreaId)} aria-invalid={!eligible} aria-describedby={!eligible || !address ? "area-error" : "area-hint"}>{areas.map((option) => { const rules = deliveryPreview.resolve(vendor.id, option.id, currentCart.orderingMode); const optionEligibility = rules?.eligibility ?? eligibilities.find((item) => item.vendorId === vendor.id && item.areaId === option.id)?.eligibility; return <option key={option.id} value={option.id}>{optionEligibility?.status === "eligible" ? "Supported" : "Unsupported"} · {option.name}</option>; })}</select><small id="area-hint" className="commerce-hint">This previews a saved area; change your active area from the header.</small></label>{(!eligible || !address) && <div id="area-error" role="alert" className="notice notice--danger"><MapPin size={17}/><div><strong>Review your delivery address.</strong><br/>{!address ? "Add a delivery address in this area." : eligibility?.status === "outside_area" ? eligibility.reason : "Delivery is not available for this area."}</div></div>}</section> : <section className="commerce-section commerce-stack"><div className="commerce-section-title"><h2>Pickup location</h2><span className="commerce-hint">{deliveryRules?.pickup.windowNote ? `Collect during ${deliveryRules.pickup.windowNote}` : "Kitchen collection"}</span></div><div className="commerce-choice commerce-address"><Store size={17}/><span><strong>{deliveryRules?.pickup.pickupAddress || `${vendor.name} Kitchen (${vendor.publicArea})`}</strong>{deliveryRules?.pickup.landmark ? <small>Landmark: {deliveryRules.pickup.landmark}</small> : null}<small className="commerce-hint">{deliveryRules?.pickup.addressNote || "Authorized collection address."}</small></span></div></section>}<section className="commerce-section commerce-stack"><h2>{delivery ? "Delivery" : "Pickup"} instructions</h2><label className="commerce-field"><span>Optional note</span><textarea className="commerce-input commerce-textarea" placeholder="Landmark or preferred call instruction" maxLength={300}/></label></section><section className="commerce-section commerce-stack"><h2>Payment method</h2><label className="commerce-choice"><input type="radio" name="paymentMethod" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")}/><span><strong>Bank transfer (Dedicated virtual account)</strong><small>Instant simulated account: Wema Bank · 0123456789 (MealHrs) · 30-min window</small></span></label><label className="commerce-choice"><input type="radio" name="paymentMethod" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")}/><span><strong>Debit card (Paystack / Flutterwave)</strong><small>Simulate payment with Visa, Mastercard or Verve card</small></span></label><label className="commerce-choice"><input type="radio" name="paymentMethod" checked={paymentMethod === "wallet"} onChange={() => setPaymentMethod("wallet")}/><span><strong>OPay / PalmPay Wallet</strong><small>Instant debit without bank network downtime</small></span></label></section><section className="commerce-section commerce-stack"><h2>Order extras</h2><label className="commerce-choice"><input type="checkbox" checked={needCutlery} onChange={(e) => setNeedCutlery(e.target.checked)}/><span><strong>Eco cutlery &amp; napkins (+₦100)</strong><small>Include disposable spoon, fork, and tissue napkins</small></span></label><div><p style={{ margin: "4px 0 8px", fontSize: "0.74rem", fontWeight: 600 }}>Tip the kitchen &amp; delivery rider (Optional)</p><div style={{ display: "flex", gap: 8 }}>{[0, 200, 500, 1000].map((amount) => (<button key={amount} type="button" className={`button ${tip === amount ? "button--primary" : "button--secondary"} button--sm`} onClick={() => setTip(amount)}>{amount === 0 ? "No tip" : `+₦${amount.toLocaleString()}`}</button>))}</div></div></section></div><aside className="commerce-section commerce-summary"><h2>Order review</h2>{rechecked ? <Notice tone="warning">The order has been rechecked. Review the total.</Notice> : <Notice tone="warning">Price, eligibility and capacity are rechecked before payment.</Notice>}{currentCart.items.map((item) => <article className="commerce-line" key={item.id}><Image src={item.imageUrl} alt={item.name} width={156} height={156}/><div><h3>{item.name}</h3><p>{item.selectedOptions.map((option) => option.value).join(" · ") || "No options selected"} · Qty {item.quantity}</p>{item.instructions && <p>Kitchen note: {item.instructions}</p>}</div><strong>{formatMoney(ngn((item.unitPrice.amount + item.selectedOptions.reduce((sum, option) => sum + option.priceDelta.amount, 0)) * item.quantity))}</strong></article>)}<div className="commerce-money"><div className="commerce-money-row"><span>Food</span><strong>{formatMoney(ngn(subtotal))}</strong></div><div className="commerce-money-row"><span>Delivery</span><strong>{formatMoney(ngn(fee))}</strong></div><div className="commerce-money-row"><span>Service charge</span><strong>{formatMoney(ngn(SERVICE_FEE_NGN))}</strong></div>{cutleryFee > 0 ? <div className="commerce-money-row"><span>Cutlery &amp; napkins</span><strong>{formatMoney(ngn(cutleryFee))}</strong></div> : null}{tip > 0 ? <div className="commerce-money-row"><span>Tip</span><strong>{formatMoney(ngn(tip))}</strong></div> : null}<div className="commerce-money-row commerce-total"><span>Pay now</span><strong>{formatMoney(ngn(total))}</strong></div></div><Button type="submit" block disabled={!canSubmit} aria-describedby={delivery && !canSubmit ? "area-error" : undefined}>{menuIssues.length ? "Review unavailable meals" : minimumOrderIssue ? "Add more to order" : "Continue to simulated payment"}</Button><Button type="button" variant="ghost" block onClick={() => setRechecked(true)}>Recheck order</Button></aside></form></div>;
}
