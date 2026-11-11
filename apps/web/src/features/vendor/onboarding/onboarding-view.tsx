"use client";

import type { VendorDashboardSnapshot } from "@mealhrs/domain";
import { Check, ChevronRight, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const steps = [
  { id: "profile", title: "Tell customers about your kitchen", detail: "Name, category, public area and food story." },
  { id: "fulfillment", title: "Set up delivery and pickup", detail: "Choose how customers can receive their meals." },
  { id: "payout_preview", title: "Review earnings preview", detail: "Understand the future settlement experience without connecting payments." },
  { id: "first_menu", title: "Add your first meal", detail: "Create an immediate dish or a planned Meal Drop." },
] as const;

export function OnboardingView({ snapshot }: Readonly<{ snapshot: VendorDashboardSnapshot }>) {
  const [completed, setCompleted] = useState(new Set(snapshot.onboarding.completedSteps));
  const ready = completed.size === steps.length;
  return <div className="vendor-onboarding"><Link className="vendor-onboarding-brand" href="/vendor">MealHrs <span>for kitchens</span></Link><div className="vendor-onboarding-card"><p className="vendor-eyebrow">Kitchen setup</p><h1>{ready ? "Your kitchen is ready" : "Set up your kitchen"}</h1><p>Start with the details that make ordering clear for your customers. You can adjust these anytime.</p><ol className="vendor-steps">{steps.map((step, index) => { const done = completed.has(step.id); return <li key={step.id}><button type="button" aria-pressed={done} onClick={() => setCompleted((current) => { const next = new Set(current); if (next.has(step.id)) next.delete(step.id); else next.add(step.id); return next; })}><span>{done ? <Check aria-hidden="true"/> : index + 1}</span><span><strong>{step.title}</strong><small>{step.detail}</small></span><ChevronRight aria-hidden="true"/></button></li>; })}</ol>{ready ? <Button asChild block><Link href="/vendor"><CircleCheck aria-hidden="true"/>Go to overview</Link></Button> : <Button block onClick={() => setCompleted(new Set(steps.map((step) => step.id)))}>Complete preview setup</Button>}<p className="vendor-preview-note">This is a frontend setup preview. No kitchen profile is published yet.</p></div></div>;
}
