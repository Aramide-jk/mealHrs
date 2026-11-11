"use client";

import type { AdminDashboardSnapshot } from "@mealhrs/domain";
import { Check, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const checkpoints = ["Access context", "Operational responsibilities", "Preview limitations"] as const;
export function AdminAccessView({ snapshot }: Readonly<{ snapshot: AdminDashboardSnapshot }>) { const [acknowledged, setAcknowledged] = useState(new Set<number>()); const ready = acknowledged.size === checkpoints.length; return <div className="admin-access"><Link href="/admin" className="admin-access-brand">MealHrs <span>control room</span></Link><section className="admin-access-card"><p className="admin-eyebrow">Admin access</p><h1>Welcome, {snapshot.access.name.split(" ")[0]}</h1><p>Use this workspace to preview platform operations safely. Real enforcement belongs to the future backend.</p><ol className="admin-checkpoints">{checkpoints.map((checkpoint, index) => { const done = acknowledged.has(index); return <li key={checkpoint}><button type="button" aria-pressed={done} onClick={() => setAcknowledged((current) => { const next = new Set(current); if (next.has(index)) next.delete(index); else next.add(index); return next; })}><span>{done ? <Check aria-hidden="true"/> : index + 1}</span><span><strong>{checkpoint}</strong><small>{index === 0 ? "Super Admin preview access is active." : index === 1 ? "Use queues deliberately; each decision remains local." : "No backend, payment, customer, or vendor record changes are connected."}</small></span><ChevronRight aria-hidden="true"/></button></li>; })}</ol>{ready ? <Button asChild block><Link href="/admin"><ShieldCheck aria-hidden="true"/>Enter control room</Link></Button> : <Button block onClick={() => setAcknowledged(new Set([0, 1, 2]))}>Acknowledge preview access</Button>}</section></div>; }
