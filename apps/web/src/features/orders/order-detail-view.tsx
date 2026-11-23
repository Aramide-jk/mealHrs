"use client";

import type { Order } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { useCartStore } from "@/features/cart/cart-store";
import { useDeliveryPreview } from "@/lib/delivery-preview-context";
import { useCustomerActivity } from "@/lib/customer-activity-context";
import "./commerce.css";

export type ProgressStep = Readonly<{ label: string; state: "done" | "current" | "pending" }>;

export function getOrderProgress(order: Order): readonly ProgressStep[] {
  if (order.orderStatus === "cancelled" || order.orderStatus === "timed_out" || order.fulfillmentStatus === "delivery_failed") {
    return [
      { label: order.paymentStatus === "paid" ? "Paid" : "Payment", state: order.paymentStatus === "paid" ? "done" : "pending" },
      { label: order.orderStatus === "timed_out" ? "Timed out" : order.fulfillmentStatus === "delivery_failed" ? "Delivery failed" : "Cancelled", state: "current" },
    ];
  }
  const fulfillmentIndex: Record<Order["fulfillmentStatus"], number> = { scheduled: 1, preparing: 1, ready_for_dispatch: 2, out_for_delivery: 2, delivered: 3, delivery_failed: 2 };
  const activeIndex = order.paymentStatus === "paid" ? fulfillmentIndex[order.fulfillmentStatus] : 0;
  return ["Paid", "Preparing", "Dispatch", "Delivered"].map((label, index) => ({ label, state: order.fulfillmentStatus === "delivered" || index < activeIndex ? "done" : index === activeIndex ? "current" : "pending" }));
}

export function OrderDetailView({ order }: { order: Order }) {
  const activity = useCustomerActivity();
  const liveStage = activity.getOrderStage(order.id) ?? activity.getOrderStage(order.reference);
  const cancellationNote = activity.getOrderCancellationNote(order.id) ?? activity.getOrderCancellationNote(order.reference);

  const effectiveFulfillmentStatus: Order["fulfillmentStatus"] =
    liveStage === "delivered"
      ? "delivered"
      : liveStage === "out_for_delivery"
        ? "out_for_delivery"
        : liveStage === "ready"
          ? "ready_for_dispatch"
          : liveStage === "preparing" || liveStage === "confirmed"
            ? "preparing"
            : liveStage === "cancelled"
              ? "delivery_failed"
              : order.fulfillmentStatus;

  const effectiveOrderStatus: Order["orderStatus"] =
    liveStage === "cancelled" ? "cancelled" : liveStage ? "confirmed" : order.orderStatus;

  const effectiveOrder: Order = {
    ...order,
    orderStatus: effectiveOrderStatus,
    fulfillmentStatus: effectiveFulfillmentStatus,
  };

  const progress = getOrderProgress(effectiveOrder);
  const exceptional =
    effectiveOrder.orderStatus === "cancelled" ||
    effectiveOrder.orderStatus === "timed_out" ||
    effectiveOrder.fulfillmentStatus === "delivery_failed";
  const preview = useCartStore((state) => state.paymentPreview);
  const deliveryPreview = useDeliveryPreview();
  const isPickup = (preview?.vendorName === order.vendorName && preview.fulfillment === "pickup") || order.fulfillmentMode === "pickup";
  const pickup = deliveryPreview.vendorId === order.vendorId ? deliveryPreview.pickup : null;
  const pickupAddress = preview?.pickupDetails?.address || pickup?.pickupAddress;
  const landmark = preview?.pickupDetails?.landmark || pickup?.landmark;
  const windowNote = preview?.pickupDetails?.windowNote || pickup?.windowNote || order.fulfillmentWindow;
  const pickupPin = activity.orderPickupPins[order.id] ?? activity.orderPickupPins[order.reference] ?? "4821";
  const rider = activity.orderRiderDetails[order.id] ?? activity.orderRiderDetails[order.reference];

  return <div className="commerce-page"><Link className="commerce-back" href="/orders">← Orders</Link><header className="commerce-head"><div className="cluster"><Status tone={exceptional ? "danger" : effectiveOrder.fulfillmentStatus === "delivered" ? "neutral" : "success"}>{effectiveOrder.fulfillmentStatus.replaceAll("_", " ")}</Status><span className="commerce-hint">Payment: {order.paymentStatus}</span></div><h1 style={{ fontSize: "1.35rem", lineHeight: 1.25, fontWeight: 600, margin: "10px 0 8px" }}>{effectiveOrder.fulfillmentStatus === "delivered" ? "Delivered" : exceptional ? "This order needs attention" : `Expected ${order.fulfillmentWindow.toLowerCase()}`}</h1><p>{isPickup ? `Collection arranged directly with ${order.vendorName}.` : `Delivery is arranged and fulfilled by ${order.vendorName}.`}</p></header><div className="commerce-grid"><div className="commerce-stack-lg">{cancellationNote ? <Notice tone="danger"><strong>Kitchen cancellation reason:</strong> {cancellationNote}</Notice> : null}{effectiveFulfillmentStatus === "out_for_delivery" && rider ? <section className="commerce-section" style={{ borderLeft: "4px solid #1f6b45", background: "#f4f8f5" }}><div className="commerce-section-title"><h2>Dispatch rider</h2><Status tone="success">En route</Status></div><p style={{ margin: "4px 0" }}><strong>{rider.name}</strong> · {rider.vehicle}</p><a href={`tel:${rider.phone}`} className="button button--secondary button--sm" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8 }}>📞 Call rider ({rider.phone})</a></section> : null}<section className="commerce-section"><div className="commerce-section-title"><h2>Order progress</h2><span className="commerce-hint">Reference {order.reference}</span></div><div className="commerce-progress">{progress.map((step, index) => <div className={`commerce-step ${step.state === "pending" ? "" : step.state}`} data-state={step.state} key={step.label}><span className="commerce-dot">{step.state === "done" ? "✓" : index + 1}</span><span>{step.label}</span></div>)}</div>{order.events.map((event) => <article className="commerce-event" key={`${event.label}-${event.occurredAt}`}><time>{event.occurredAt}</time><h3>{event.label}</h3><p>{event.detail}</p></article>)}</section><section className="commerce-section"><h2>Items</h2>{order.items.map((item) => <article className="commerce-line" key={item.id}><Image src={item.imageUrl} alt={item.name} width={156} height={156}/><div><h3>{item.name}</h3><p>{item.selectedOptions.map((option) => option.value).join(" · ")} · Qty {item.quantity}</p></div><strong>{formatMoney(item.unitPrice)}</strong></article>)}</section><section className="commerce-section"><h2>Need help?</h2><div className="cluster"><Button asChild variant="secondary"><Link href="/support">Contact support</Link></Button><Button asChild variant="ghost"><Link href="/support/disputes/new">Report an order issue</Link></Button></div></section></div><aside className="commerce-stack commerce-summary"><section className="commerce-section"><h2>Fulfillment</h2><div className="commerce-facts"><div className="commerce-fact"><small>Vendor</small><strong>{order.vendorName}</strong></div><div className="commerce-fact"><small>Method</small><strong>{isPickup ? "Pickup" : "Vendor delivery"}</strong></div><div className="commerce-fact"><small>Window</small><strong>{windowNote}</strong></div>{isPickup && pickupPin ? <div className="commerce-fact"><small>Pickup verification PIN</small><strong style={{ letterSpacing: 2, fontSize: "1.1rem", color: "#185437" }}>{pickupPin}</strong></div> : null}{isPickup && pickupAddress ? <div className="commerce-fact"><small>Pickup location</small><strong>{pickupAddress}</strong></div> : null}{isPickup && landmark ? <div className="commerce-fact"><small>Landmark</small><strong>{landmark}</strong></div> : null}<div className="commerce-fact"><small>Status</small><strong>{effectiveOrder.fulfillmentStatus.replaceAll("_", " ")}</strong></div></div></section><section className="commerce-section"><h2>Payment and order</h2><div className="commerce-money"><div className="commerce-money-row"><span>Payment</span><strong>{order.paymentStatus}</strong></div><div className="commerce-money-row"><span>Order</span><strong>{effectiveOrder.orderStatus}</strong></div><div className="commerce-money-row"><span>Fulfillment</span><strong>{effectiveOrder.fulfillmentStatus}</strong></div><div className="commerce-money-row commerce-total"><span>Total</span><strong>{formatMoney(order.total)}</strong></div></div></section>{exceptional && <Notice tone="warning">Payment, order and fulfillment outcomes are tracked separately. Contact support for the verified resolution status.</Notice>}{effectiveOrder.fulfillmentStatus === "delivered" && order.paymentStatus === "paid" && <Button asChild block><Link href={`/orders/${order.id}/review`}>Review this order</Link></Button>}</aside></div></div>;
}
