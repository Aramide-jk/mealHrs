"use client";

import type { Cart, Vendor } from "@mealhrs/domain";
import { formatMoney, ngn } from "@mealhrs/domain";
import { CalendarDays, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Status } from "@/components/ui/status";
import { SERVICE_FEE_NGN } from "./pricing";
import { useCartStore } from "./cart-store";
import { isImmediateOrderingOpen, useMenuPreview } from "@/lib/menu-preview-context";
import { isCutoffPassed } from "@/features/meal-drops/effective-availability";

export function CartView({ seed, deliveryFees, vendors, loadError = false }: { seed: Cart | null; deliveryFees: Readonly<Record<string, number>>; vendors: readonly Vendor[]; loadError?: boolean }) {
  const { cart, hydrateSeed, removeItem, setQuantity } = useCartStore();
  const { items: previewItems, mealDrops, schedule } = useMenuPreview();
  useEffect(() => hydrateSeed(seed), [hydrateSeed, seed]);
  const visible = useMemo(() => (cart?.items ?? []).map((item) => item.instructions ? { ...item, selectedOptions: [...item.selectedOptions, { name: "Kitchen note", value: `Kitchen note: ${item.instructions}`, priceDelta: ngn(0) }] } : item), [cart]);
  const vendor = vendors.find((candidate) => candidate.id === cart?.vendorId) ?? null;
  const deliveryFee = cart ? (deliveryFees[cart.vendorId] ?? 0) : 0;
  const subtotal = useMemo(() => visible.reduce((sum, item) => {
    const optionDelta = item.selectedOptions.reduce((optionSum, option) => optionSum + option.priceDelta.amount, 0);
    return sum + (item.unitPrice.amount + optionDelta) * item.quantity;
  }, 0), [visible]);
  const now = new Date().toISOString();
  const previewIssue = (itemId: string) => {
    const preview = previewItems.find((item) => item.offer.id === itemId);
    if (!preview) return null;
    if (preview.archived || preview.offer.availability.status === "unavailable" || preview.remainingToday < 1) return "This meal is no longer available.";
    if (preview.offer.orderingMode === "immediate" && !isImmediateOrderingOpen(schedule)) return schedule.specialClosureNote || "Immediate ordering is closed right now.";
    if (preview.offer.orderingMode === "meal_drop") {
      const drop = mealDrops.find((entry) => entry.id === preview.offer.mealDropId);
      if (!drop || drop.remainingCapacity < 1 || drop.status !== "open" || isCutoffPassed(drop.cutoffAt, now)) return "This pre-order is no longer accepting orders.";
    }
    return null;
  };
  const unavailableItems = visible.filter((item) => previewIssue(item.offerId));

  if (loadError) return <div className="commerce-page commerce-narrow"><EmptyState icon={<ShoppingBag />} title="We could not load your order" description="Your saved order has not been changed. Try loading it again." action={<Button onClick={() => location.reload()}>Try again</Button>} /></div>;

  if (visible.length === 0) return <div className="commerce-page commerce-narrow"><EmptyState icon={<ShoppingBag />} title="Your order is empty" description="Choose something fresh when you are ready." action={<Button asChild><Link href={vendor ? `/k/${vendor.slug}` : "/discover"}>Browse the menu</Link></Button>} /></div>;
  if (!cart || !vendor) return <div className="commerce-page commerce-narrow"><EmptyState title="This order needs a refresh" description="We could not match the saved kitchen. Your selection remains on this device." action={<Button onClick={() => location.reload()}>Try again</Button>} /></div>;

  return <div className="commerce-page"><Link className="commerce-back" href={`/k/${vendor.slug}`}>← {vendor.name}</Link><header className="commerce-head"><p className="commerce-eyebrow">One vendor · {cart.orderingMode === "immediate" ? "immediate order" : "Pre-order"}</p><h1>Your order</h1><p>Review choices before checkout. Immediate and future meals are checked out separately.</p></header>{unavailableItems.length ? <div className="notice notice--warning" role="alert">{unavailableItems.map((item) => `${item.name}: ${previewIssue(item.offerId)}`).join(" ")} Remove unavailable meals before checkout.</div> : null}<div className="commerce-grid"><div className="commerce-stack"><section className="commerce-section"><div className="commerce-section-title"><h2>{vendor.name}</h2><Status>{unavailableItems.length ? "Review order" : "Available now"}</Status></div>{visible.map((item) => { const quantity = item.quantity; const options = item.selectedOptions.map((option) => option.value).join(" · "); const unit = item.unitPrice.amount + item.selectedOptions.reduce((sum, option) => sum + option.priceDelta.amount, 0); const preview = previewItems.find((entry) => entry.offer.id === item.offerId); const maxQuantity = preview?.remainingToday ?? Number.POSITIVE_INFINITY; return <article className="commerce-line" key={item.id}><Image src={item.imageUrl} alt={item.name} width={156} height={156}/><div><h3>{item.name}</h3><p>{options || "No options selected"}</p>{previewIssue(item.offerId) ? <p className="commerce-hint">{previewIssue(item.offerId)}</p> : null}<div className="commerce-actions"><div className="commerce-quantity"><button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => setQuantity(item.id, quantity - 1)}><Minus size={14}/></button><output>{quantity}</output><button type="button" aria-label={`Increase ${item.name} quantity`} disabled={quantity >= maxQuantity} onClick={() => setQuantity(item.id, Math.min(maxQuantity, quantity + 1))}><Plus size={14}/></button></div><button className="commerce-remove" type="button" onClick={() => removeItem(item.id)}>Remove</button></div></div><strong className="commerce-price">{formatMoney(ngn(unit * quantity))}</strong></article>; })}</section><div className="commerce-compat"><CalendarDays size={17}/><div><strong>Future meals need a separate order</strong>A pre-order with a different fulfillment window cannot be combined with today&apos;s order. <Link href="/drops/drop-sunday-jollof"><u>View pre-order</u></Link></div></div><Button asChild variant="secondary"><Link href={`/k/${vendor.slug}`}>Add another meal</Link></Button></div><aside className="commerce-section commerce-summary"><div className="commerce-section-title"><h2>Summary</h2></div><div className="commerce-money"><div className="commerce-money-row"><span>Food subtotal</span><strong>{formatMoney(ngn(subtotal))}</strong></div><div className="commerce-money-row"><span>Estimated vendor delivery</span><strong>{formatMoney(ngn(deliveryFee))}</strong></div><div className="commerce-money-row"><span>Service charge</span><strong>{formatMoney(ngn(SERVICE_FEE_NGN))}</strong></div><div className="commerce-money-row commerce-total"><span>Estimated total</span><strong>{formatMoney(ngn(subtotal + deliveryFee + SERVICE_FEE_NGN))}</strong></div></div><p className="commerce-hint">Eligibility, price and capacity are rechecked before the payment preview.</p>{unavailableItems.length ? <Button block disabled>Review unavailable meals</Button> : <Button asChild block><Link href="/checkout">Continue to checkout</Link></Button>}</aside></div></div>;
}
