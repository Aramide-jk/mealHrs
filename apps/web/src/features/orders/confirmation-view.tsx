"use client";

import type { Order } from "@mealhrs/domain";
import { formatMoney, ngn } from "@mealhrs/domain";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/cart-store";

export function ConfirmationView({ order }: Readonly<{ order: Order }>) {
  const preview = useCartStore((state) => state.paymentPreview);
  const itemCount = preview?.cart.items.reduce((count, item) => count + item.quantity, 0) ?? order.items.reduce((count, item) => count + item.quantity, 0);
  const total = preview ? formatMoney(ngn(preview.total)) : formatMoney(order.total);
  const isPickup = preview?.fulfillment === "pickup" || order.fulfillmentMode === "pickup";
  const fulfillment = isPickup ? "Pickup" : "Vendor delivery";
  const vendorName = preview?.vendorName ?? order.vendorName;

  return <div className="commerce-result-wrap"><section className="commerce-result"><div className="commerce-result-icon"><Check /></div><p className="commerce-eyebrow">Order preview confirmed</p><h1>{vendorName} has your preview order</h1><p>These details carry through from checkout. No payment was collected and no order was sent to the kitchen.</p><span className="commerce-reference">Preview reference · {order.reference}</span><div className="commerce-money" style={{ margin: "22px 0", textAlign: "left" }}><div className="commerce-money-row"><span>Fulfillment</span><strong>{fulfillment}</strong></div>{isPickup && preview?.pickupDetails ? <><div className="commerce-money-row"><span>Collection point</span><strong>{preview.pickupDetails.address}</strong></div>{preview.pickupDetails.landmark ? <div className="commerce-money-row"><span>Landmark</span><strong>{preview.pickupDetails.landmark}</strong></div> : null}<div className="commerce-money-row"><span>Collection hours</span><strong>{preview.pickupDetails.windowNote}</strong></div></> : null}<div className="commerce-money-row"><span>Items</span><strong>{itemCount}</strong></div>{isPickup ? <div className="commerce-money-row"><span>Pickup verification PIN</span><strong style={{ letterSpacing: 2, color: "#185437" }}>4821</strong></div> : null}<div className="commerce-money-row commerce-total"><span>Preview total</span><strong>{total}</strong></div></div><div className="commerce-stack"><Button asChild><Link href="/discover">Keep discovering</Link></Button><Button asChild variant="secondary"><Link href="/orders">View order history</Link></Button></div></section></div>;
}
