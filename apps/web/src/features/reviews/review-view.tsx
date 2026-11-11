"use client";

import type { Order } from "@mealhrs/domain";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const dimensions = ["Food quality", "Portion and value", "Fulfillment reliability"] as const;

export function ReviewView({ order }: { order: Order }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const success = useRef<HTMLElement>(null);
  const valid = useMemo(() => dimensions.every((dimension) => (ratings[dimension] ?? 0) > 0) && text.trim().length >= 10, [ratings, text]);
  if (sent) return <div className="commerce-page commerce-narrow"><section ref={success} tabIndex={-1} className="commerce-success" role="status" aria-live="polite"><div className="commerce-result-icon"><Check/></div><h1>Review preview complete</h1><p>This frontend preview has not published your review of {order.vendorName}. Your feedback will be submitted when the review API is connected.</p><Button asChild><Link href={`/orders/${order.id}`}>Return to order</Link></Button></section></div>;
  return <div className="commerce-page commerce-narrow"><Link className="commerce-back" href={`/orders/${order.id}`}>← Order {order.reference}</Link><form className="commerce-section commerce-stack-lg" onSubmit={(event) => { event.preventDefault(); if (valid) { setSent(true); setTimeout(() => success.current?.focus(), 0); } }}><div><p className="commerce-eyebrow">Verified purchase</p><h1>How was your order?</h1><p>Reviews help customers choose reliable kitchens. Your private order information is never published.</p></div><div>{dimensions.map((dimension) => <div className="commerce-rating" key={dimension}><span>{dimension}</span><div className="commerce-stars" role="group" aria-label={`Rate ${dimension.toLowerCase()}`}>{[1,2,3,4,5].map((value) => <button type="button" className={`commerce-star ${value <= (ratings[dimension] ?? 0) ? "active" : ""}`} aria-label={`${value} stars for ${dimension.toLowerCase()}`} aria-pressed={ratings[dimension] === value} onClick={() => setRatings((current) => ({...current, [dimension]: value}))} key={value}><Star size={20} fill="currentColor"/></button>)}</div></div>)}</div><label className="commerce-field"><span>Tell others what stood out</span><textarea className="commerce-input commerce-textarea" value={text} onChange={(event) => setText(event.target.value)} minLength={10} required/><small className="commerce-hint">At least 10 characters. Keep personal details private.</small></label><p id="review-hint" className="commerce-hint" aria-live="polite">{valid ? "Ready to publish." : "Rate all three dimensions and write at least 10 characters to continue."}</p><Button type="submit" block disabled={!valid} aria-describedby="review-hint">Publish verified review</Button></form></div>;
}
