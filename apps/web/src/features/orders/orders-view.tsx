"use client";

import type { Order } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Status } from "@/components/ui/status";

type Tab = "active" | "history" | "loading" | "empty";

export function OrdersView({ orders }: { orders: readonly Order[] }) {
  const [tab, setTab] = useState<Tab>("active");
  const visible = tab === "history" ? orders.filter((order) => order.fulfillmentStatus === "delivered") : orders.filter((order) => order.fulfillmentStatus !== "delivered");
  return <div className="commerce-page"><header className="commerce-head"><p className="commerce-eyebrow">Your purchases</p><h1>Orders</h1><p>Track current meals and return to the kitchens you enjoy.</p></header><div className="commerce-tabs" role="tablist" aria-label="Order views">{(["active", "history", "loading", "empty"] as Tab[]).map((candidate) => <button key={candidate} role="tab" aria-selected={tab === candidate} onClick={() => setTab(candidate)}>{candidate[0]?.toUpperCase() + candidate.slice(1)}</button>)}</div><section aria-live="polite" className="commerce-stack">{tab === "loading" ? <><span className="sr-only">Loading orders</span><Skeleton style={{height:100}}/><Skeleton style={{height:100}}/></> : tab === "empty" ? <EmptyState title="No previous orders yet" description="When you order from a kitchen, receipts and tracking history will appear here." action={<Button asChild><Link href="/discover">Discover food</Link></Button>}/> : visible.map((order) => <Link className="commerce-order-card" href={`/orders/${order.id}`} key={order.id}><Image src={order.items[0]?.imageUrl ?? "/assets/hero-jollof.png"} alt={order.items[0]?.name ?? "Meal"} width={144} height={144}/><div><div className="cluster"><Status tone={order.orderStatus === "cancelled" || order.fulfillmentStatus === "delivery_failed" ? "danger" : order.fulfillmentStatus === "delivered" ? "neutral" : "success"}>{order.fulfillmentStatus.replaceAll("_", " ")}</Status></div><h3>{order.vendorName}</h3><p>{order.items[0]?.name} · {order.reference}</p></div><div className="commerce-order-meta"><strong>{formatMoney(order.total)}</strong><span className="commerce-hint">View order ›</span></div></Link>)}</section></div>;
}
