"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

type State = "form" | "success" | "error";

export function DisputeView() {
  const [state, setState] = useState<State>("form");
  const [detail, setDetail] = useState("");
  const successRef = useRef<HTMLElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  function preview(value: State) { setState(value); setTimeout(() => (value === "error" ? errorRef.current : successRef.current)?.focus(), 0); }
  if (state === "success") return <div className="commerce-page commerce-narrow"><section ref={successRef} tabIndex={-1} className="commerce-success" role="status" aria-live="polite"><div className="commerce-result-icon"><Check /></div><h1>Case preview complete</h1><p>No support case was submitted. Your description remains in this frontend preview until a support API is connected.</p><Button asChild><Link href="/orders/order-mh-19733">Return to order</Link></Button></section></div>;
  return <div className="commerce-page commerce-narrow"><Link className="commerce-back" href="/support">← Help and support</Link><div className="commerce-tabs" role="group" aria-label="Preview state"><button type="button" onClick={() => setState("form")}>Form</button><button type="button" onClick={() => preview("success")}>Success</button><button type="button" onClick={() => preview("error")}>Error / retry</button></div><form className="commerce-section commerce-stack-lg" onSubmit={(event) => { event.preventDefault(); if (detail.trim().length >= 20) preview("success"); }}>{state === "error" && <div ref={errorRef} tabIndex={-1}><Notice tone="danger"><strong>We could not submit your case.</strong><br />Your answers are still here. Check your connection and try again.</Notice></div>}<div><p className="commerce-eyebrow">Order MH-19733</p><h1>Report an order issue</h1><p>Your order, payment and fulfillment history will be attached.</p></div><label className="commerce-field"><span>What went wrong?</span><select className="commerce-input" required defaultValue=""><option value="" disabled>Choose an issue</option><option>Missing item</option><option>Wrong item</option><option>Order not delivered</option><option>Food quality concern</option></select></label><label className="commerce-field"><span>Tell us what happened</span><textarea className="commerce-input commerce-textarea" value={detail} onChange={(event) => setDetail(event.target.value)} minLength={20} required /><small className="commerce-hint">At least 20 characters. Your draft is retained if submission fails.</small></label><div className="commerce-field"><span>Evidence (optional)</span><button className="commerce-evidence" type="button">Add a clear photo or receipt</button></div><label className="commerce-field"><span>Preferred resolution</span><select className="commerce-input"><option>Review for a partial refund</option><option>Review for a full refund</option><option>Contact me first</option></select></label><Notice>Submitting creates a support case. It does not automatically approve a refund.</Notice><Button type="submit" block disabled={detail.trim().length < 20}>Submit support case</Button></form></div>;
}
