"use client";

import { formatMoney, type AdminCustomerRecord, type AdminDispute, type AdminModerationItem, type AdminOrderReview, type AdminVendorReview } from "@mealhrs/domain";
import { Check, CircleAlert, Eye, Pause, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import styles from "./admin-operations.module.css";

export function VendorReviewView({ vendors }: Readonly<{ vendors: readonly AdminVendorReview[] }>) {
  const [states, setStates] = useState<Record<string, AdminVendorReview["status"]>>({});
  const [feedback, setFeedback] = useState("");
  return <Page title="Vendor reviews" eyebrow="Trust and quality" description="Review kitchen records before they appear on the marketplace. Actions are local preview changes only."><Queue>{vendors.map(({ reviewNote, status, submittedAt, vendor }) => { const current = states[vendor.id] ?? status; return <article className={styles.row} key={vendor.id}><div><div className={styles.rowMeta}><Status tone={current === "approved" ? "success" : current === "pending_review" ? "warning" : "neutral"}>{current.replaceAll("_", " ")}</Status><span>{submittedAt}</span></div><h2>{vendor.name}</h2><p>{vendor.category} · {vendor.publicArea} · {reviewNote}</p></div><div className={styles.actions}>{current === "pending_review" ? <Button size="sm" onClick={() => { setStates((items) => ({ ...items, [vendor.id]: "approved" })); setFeedback(`${vendor.name} approval updated locally.`); }}><Check size={15}/>Approve preview</Button> : null}<Button size="sm" variant="secondary" onClick={() => { setStates((items) => ({ ...items, [vendor.id]: "paused" })); setFeedback(`${vendor.name} pause state updated locally.`); }}><Pause size={15}/>Pause preview</Button></div></article>; })}</Queue><Feedback text={feedback}/></Page>;
}

export function CustomerReviewView({ customers }: Readonly<{ customers: readonly AdminCustomerRecord[] }>) {
  const [states, setStates] = useState<Record<string, AdminCustomerRecord["status"]>>({});
  const [feedback, setFeedback] = useState("");
  return <Page title="Customers" eyebrow="Account review" description="Inspect customer account activity. Restriction changes are local previews and do not affect a real account."><Queue>{customers.map((customer) => { const current = states[customer.id] ?? customer.status; return <article className={styles.row} key={customer.id}><div><div className={styles.rowMeta}><Status tone={current === "active" ? "success" : "warning"}>{current}</Status><span>Joined {customer.joinedAt}</span></div><h2>{customer.name}</h2><p>{customer.email} · {customer.orderCount} orders</p></div><div className={styles.actions}><Button size="sm" variant="secondary" onClick={() => { setStates((items) => ({ ...items, [customer.id]: current === "active" ? "restricted" : "active" })); setFeedback(`${customer.name} account state updated locally.`); }}>{current === "active" ? "Restrict preview" : "Restore preview"}</Button></div></article>; })}</Queue><Feedback text={feedback}/></Page>;
}

export function OrderReviewView({ orders }: Readonly<{ orders: readonly AdminOrderReview[] }>) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  return <Page title="Order intervention" eyebrow="Operational review" description="Review exceptional orders without changing the underlying customer or vendor order record."><Queue>{orders.map(({ adminNote, interventionStatus, order }) => <article className={styles.row} key={order.id}><div><div className={styles.rowMeta}><Status tone={interventionStatus === "none" ? "neutral" : "warning"}>{interventionStatus.replaceAll("_", " ")}</Status><span>{order.reference}</span><span>{formatMoney(order.total)}</span></div><h2>{order.vendorName}</h2><p>{order.fulfillmentMode} · {order.fulfillmentStatus.replaceAll("_", " ")} · {adminNote ?? "No intervention note"}</p></div><div className={styles.actions}><Button size="sm" variant="secondary" onClick={() => { setNotes((items) => ({ ...items, [order.id]: "Review note added locally." })); setFeedback(`${order.reference} marked reviewed in this preview.`); }}><Eye size={15}/>Review preview</Button></div>{notes[order.id] ? <p className={styles.localNote}>{notes[order.id]}</p> : null}</article>)}</Queue><Feedback text={feedback}/></Page>;
}

export function DisputesView({ disputes }: Readonly<{ disputes: readonly AdminDispute[] }>) {
  const [states, setStates] = useState<Record<string, AdminDispute["status"]>>({});
  const [feedback, setFeedback] = useState("");
  return <Page title="Disputes" eyebrow="Customer support" description="Move a dispute through a local review preview. No refund, payment, or order mutation is connected."><Queue>{disputes.map((dispute) => { const current = states[dispute.id] ?? dispute.status; return <article className={styles.row} key={dispute.id}><div><div className={styles.rowMeta}><Status tone={current === "resolved" ? "success" : "warning"}>{current.replaceAll("_", " ")}</Status><span>{dispute.openedAt}</span></div><h2>{dispute.topic}</h2><p>{dispute.customerName} · Order {dispute.orderId}</p></div><div className={styles.actions}>{current !== "resolved" ? <Button size="sm" onClick={() => { setStates((items) => ({ ...items, [dispute.id]: "resolved" })); setFeedback(`${dispute.id} resolved locally; no refund was issued.`); }}><Check size={15}/>Resolve preview</Button> : <Status tone="success">Resolved preview</Status>}</div></article>; })}</Queue><Feedback text={feedback}/></Page>;
}

export function ModerationView({ items }: Readonly<{ items: readonly AdminModerationItem[] }>) {
  const [states, setStates] = useState<Record<string, AdminModerationItem["status"]>>({});
  const [feedback, setFeedback] = useState("");
  return <Page title="Content moderation" eyebrow="Marketplace quality" description="Review dishes, Meal Drops, and Reels content. Visibility changes are preview-only until moderation services exist."><Queue>{items.map((item) => { const current = states[item.id] ?? item.status; return <article className={styles.row} key={item.id}><div><div className={styles.rowMeta}><Status tone={current === "visible" ? "success" : current === "flagged" ? "danger" : "warning"}>{current.replaceAll("_", " ")}</Status><span>{item.kind.replaceAll("_", " ")}</span></div><h2>{item.title}</h2><p>{item.vendorName}{item.reason ? ` · ${item.reason}` : ""}</p></div><div className={styles.actions}><Button size="sm" onClick={() => { setStates((values) => ({ ...values, [item.id]: "visible" })); setFeedback(`${item.title} marked visible locally.`); }}><ShieldCheck size={15}/>Allow preview</Button><Button size="sm" variant="secondary" onClick={() => { setStates((values) => ({ ...values, [item.id]: "flagged" })); setFeedback(`${item.title} flagged locally.`); }}><CircleAlert size={15}/>Flag preview</Button></div></article>; })}</Queue><Feedback text={feedback}/></Page>;
}

function Page({ children, description, eyebrow, title }: Readonly<{ children: React.ReactNode; description: string; eyebrow: string; title: string }>) { return <div className={styles.page}><header className={styles.head}><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></header>{children}</div>; }
function Queue({ children }: Readonly<{ children: React.ReactNode }>) { return <section className={styles.queue}>{children}</section>; }
function Feedback({ text }: Readonly<{ text: string }>) { return text ? <p className={styles.feedback} role="status"><UserRound size={15}/>{text}</p> : null; }
