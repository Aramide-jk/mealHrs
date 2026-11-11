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

export function CartView({ seed, deliveryFees, vendors, loadError = false }: { seed: Cart | null; deliveryFees: Readonly<Record<string, number>>; vendors: readonly Vendor[]; loadError?: boolean }) {
  const { cart, hydrateSeed, removeItem, setQuantity } = useCartStore();
  useEffect(() => hydrateSeed(seed), [hydrateSeed, seed]);
  const visible = useMemo(() => (cart?.items ?? []).map((item) => item.instructions ? { ...item, selectedOptions: [...item.selectedOptions, { name: "Kitchen note", value: `Kitchen note: ${item.instructions}`, priceDelta: ngn(0) }] } : item), [cart]);
  const vendor = vendors.find((candidate) => candidate.id === cart?.vendorId) ?? null;
  const deliveryFee = cart ? (deliveryFees[cart.vendorId] ?? 0) : 0;
  const subtotal = useMemo(() => visible.reduce((sum, item) => {
    const optionDelta = item.selectedOptions.reduce((optionSum, option) => optionSum + option.priceDelta.amount, 0);
    return sum + (item.unitPrice.amount + optionDelta) * item.quantity;
  }, 0), [visible]);

  if (loadError) return <div className="commerce-page commerce-narrow"><EmptyState icon={<ShoppingBag />} title="We could not load your order" description="Your saved order has not been changed. Try loading it again." action={<Button onClick={() => location.reload()}>Try again</Button>} /></div>;

  if (visible.length === 0) return <div className="commerce-page commerce-narrow"><EmptyState icon={<ShoppingBag />} title="Your order is empty" description="Choose something fresh when you are ready." action={<Button asChild><Link href={vendor ? `/k/${vendor.slug}` : "/discover"}>Browse the menu</Link></Button>} /></div>;
  if (!cart || !vendor) return <div className="commerce-page commerce-narrow"><EmptyState title="This order needs a refresh" description="We could not match the saved kitchen. Your selection remains on this device." action={<Button onClick={() => location.reload()}>Try again</Button>} /></div>;

  return <div className="commerce-page"><Link className="commerce-back" href={`/k/${vendor.slug}`}>← {vendor.name}</Link><header className="commerce-head"><p className="commerce-eyebrow">One vendor · {cart.orderingMode === "immediate" ? "immediate order" : "Meal Drop"}</p><h1>Your order</h1><p>Review choices before checkout. Immediate and future meals are checked out separately.</p></header><div className="commerce-grid"><div className="commerce-stack"><section className="commerce-section"><div className="commerce-section-title"><h2>{vendor.name}</h2><Status>Available now</Status></div>{visible.map((item) => { const quantity = item.quantity; const options = item.selectedOptions.map((option) => option.value).join(" · "); const unit = item.unitPrice.amount + item.selectedOptions.reduce((sum, option) => sum + option.priceDelta.amount, 0); return <article className="commerce-line" key={item.id}><Image src={item.imageUrl} alt={item.name} width={156} height={156}/><div><h3>{item.name}</h3><p>{options || "No options selected"}</p><div className="commerce-actions"><div className="commerce-quantity"><button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => setQuantity(item.id, quantity - 1)}><Minus size={14}/></button><output>{quantity}</output><button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => setQuantity(item.id, quantity + 1)}><Plus size={14}/></button></div><button className="commerce-remove" type="button" onClick={() => removeItem(item.id)}>Remove</button></div></div><strong className="commerce-price">{formatMoney(ngn(unit * quantity))}</strong></article>; })}</section><div className="commerce-compat"><CalendarDays size={17}/><div><strong>Future meals need a separate order</strong>A Meal Drop with a different fulfillment window cannot be combined with today&apos;s order. <Link href="/drops/drop-sunday-jollof"><u>View Meal Drop</u></Link></div></div><Button asChild variant="secondary"><Link href={`/k/${vendor.slug}`}>Add another meal</Link></Button></div><aside className="commerce-section commerce-summary"><div className="commerce-section-title"><h2>Summary</h2></div><div className="commerce-money"><div className="commerce-money-row"><span>Food subtotal</span><strong>{formatMoney(ngn(subtotal))}</strong></div><div className="commerce-money-row"><span>Estimated vendor delivery</span><strong>{formatMoney(ngn(deliveryFee))}</strong></div><div className="commerce-money-row"><span>Service charge</span><strong>{formatMoney(ngn(SERVICE_FEE_NGN))}</strong></div><div className="commerce-money-row commerce-total"><span>Estimated total</span><strong>{formatMoney(ngn(subtotal + deliveryFee + SERVICE_FEE_NGN))}</strong></div></div><p className="commerce-hint">Choose delivery or pickup at checkout. Eligibility, price and capacity are rechecked there.</p><Button asChild block><Link href="/checkout">Continue to checkout</Link></Button></aside></div></div>;
}
