import type { Order } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

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
  const progress = getOrderProgress(order);
  const exceptional = order.orderStatus === "cancelled" || order.orderStatus === "timed_out" || order.fulfillmentStatus === "delivery_failed";
  return <div className="commerce-page"><Link className="commerce-back" href="/orders">← Orders</Link><header className="commerce-head"><div className="cluster"><Status tone={exceptional ? "danger" : order.fulfillmentStatus === "delivered" ? "neutral" : "success"}>{order.fulfillmentStatus.replaceAll("_", " ")}</Status><span className="commerce-hint">Payment: {order.paymentStatus}</span></div><h1>{order.fulfillmentStatus === "delivered" ? "Delivered" : exceptional ? "This order needs attention" : `Expected ${order.fulfillmentWindow.toLowerCase()}`}</h1><p>Delivery is arranged and fulfilled by {order.vendorName}.</p></header><div className="commerce-grid"><div className="commerce-stack-lg"><section className="commerce-section"><div className="commerce-section-title"><h2>Order progress</h2><span className="commerce-hint">Reference {order.reference}</span></div><div className="commerce-progress">{progress.map((step, index) => <div className={`commerce-step ${step.state === "pending" ? "" : step.state}`} data-state={step.state} key={step.label}><span className="commerce-dot">{step.state === "done" ? "✓" : index + 1}</span><span>{step.label}</span></div>)}</div>{order.events.map((event) => <article className="commerce-event" key={`${event.label}-${event.occurredAt}`}><time>{event.occurredAt}</time><h3>{event.label}</h3><p>{event.detail}</p></article>)}</section><section className="commerce-section"><h2>Items</h2>{order.items.map((item) => <article className="commerce-line" key={item.id}><Image src={item.imageUrl} alt={item.name} width={156} height={156}/><div><h3>{item.name}</h3><p>{item.selectedOptions.map((option) => option.value).join(" · ")} · Qty {item.quantity}</p></div><strong>{formatMoney(item.unitPrice)}</strong></article>)}</section><section className="commerce-section"><h2>Need help?</h2><div className="cluster"><Button asChild variant="secondary"><Link href="/support">Contact support</Link></Button><Button asChild variant="ghost"><Link href="/support/disputes/new">Report an order issue</Link></Button></div></section></div><aside className="commerce-stack commerce-summary"><section className="commerce-section"><h2>Fulfillment</h2><div className="commerce-facts"><div className="commerce-fact"><small>Vendor</small><strong>{order.vendorName}</strong></div><div className="commerce-fact"><small>Method</small><strong>Vendor delivery</strong></div><div className="commerce-fact"><small>Window</small><strong>{order.fulfillmentWindow}</strong></div><div className="commerce-fact"><small>Status</small><strong>{order.fulfillmentStatus.replaceAll("_", " ")}</strong></div></div></section><section className="commerce-section"><h2>Payment and order</h2><div className="commerce-money"><div className="commerce-money-row"><span>Payment</span><strong>{order.paymentStatus}</strong></div><div className="commerce-money-row"><span>Order</span><strong>{order.orderStatus}</strong></div><div className="commerce-money-row"><span>Fulfillment</span><strong>{order.fulfillmentStatus}</strong></div><div className="commerce-money-row commerce-total"><span>Total</span><strong>{formatMoney(order.total)}</strong></div></div></section>{exceptional && <Notice tone="warning">Payment, order and fulfillment outcomes are tracked separately. Contact support for the verified resolution status.</Notice>}{order.fulfillmentStatus === "delivered" && order.paymentStatus === "paid" && <Button asChild block><Link href={`/orders/${order.id}/review`}>Review this order</Link></Button>}</aside></div></div>;
}
