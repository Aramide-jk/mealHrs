"use client";

import { Check, Clock3, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { formatMoney, ngn } from "@mealhrs/domain";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/cart-store";

export type PaymentPreviewInitialState = "pending" | "failed";
type PaymentState = PaymentPreviewInitialState | "success";

export function PaymentResultView({ initialState = "pending" }: Readonly<{ initialState?: PaymentPreviewInitialState }>) {
  const preview = useCartStore((state) => state.paymentPreview);
  const [state, setState] = useState<PaymentState>(initialState);

  useEffect(() => {
    if (state !== "pending") return;
    const timer = window.setTimeout(() => setState("success"), 1300);
    return () => window.clearTimeout(timer);
  }, [state]);

  const total = preview?.total ?? 4950;
  const itemCount = preview?.cart.items.reduce((count, item) => count + item.quantity, 0) ?? 1;
  const vendorName = preview?.vendorName ?? "Amaka's Kitchen";
  const paymentMethodLabel = preview?.paymentMethod === "bank_transfer" ? "Bank transfer (Virtual account)" : preview?.paymentMethod === "card" ? "Debit card (Paystack)" : preview?.paymentMethod === "wallet" ? "OPay / PalmPay" : undefined;
  const summary = { itemCount, total, vendorName, paymentMethodLabel };

  if (state === "failed") {
    return <PaymentResultFrame icon={<X />} tone="failed" title="Payment preview was not completed" description="No charge was made. Your order details are still saved in this preview, so you can safely try again." summary={summary} action={<><Button onClick={() => setState("pending")}><RotateCcw size={16} />Try preview again</Button><Button asChild variant="secondary"><Link href="/checkout">Return to checkout</Link></Button></>} />;
  }

  if (state === "success") {
    return <PaymentResultFrame icon={<Check />} title="Payment preview complete" description="Your order details have been carried into this confirmation preview. No payment provider was contacted and no real charge was made." summary={summary} action={<Button asChild><Link href="/orders/confirmation/order-mh-20481">View order confirmation</Link></Button>} />;
  }

  return <PaymentResultFrame icon={<Clock3 />} tone="pending" title="Processing your payment preview" description="We’re securely checking your order details. This should only take a moment." summary={summary} action={<span className="commerce-hint" role="status" aria-live="polite">Confirming your preview…</span>} />;
}

function PaymentResultFrame({ action, description, icon, summary, title, tone = "" }: Readonly<{ action: ReactNode; description: string; icon: ReactNode; summary: { itemCount: number; total: number; vendorName: string; paymentMethodLabel?: string | undefined }; title: string; tone?: string }>) {
  const itemLabel = `${summary.itemCount} item${summary.itemCount === 1 ? "" : "s"}`;
  return <div className="commerce-result-wrap"><section className="commerce-result"><div className={`commerce-result-icon ${tone}`}>{icon}</div><p className="commerce-eyebrow">Secure payment preview</p><h1>{title}</h1><p>{description}</p><div className="commerce-money" style={{ margin: "22px 0", textAlign: "left" }}><div className="commerce-money-row"><span>Order</span><strong>{summary.vendorName} · {itemLabel}</strong></div>{summary.paymentMethodLabel ? <div className="commerce-money-row"><span>Payment rail</span><strong>{summary.paymentMethodLabel}</strong></div> : null}<div className="commerce-money-row commerce-total"><span>Preview total</span><strong>{formatMoney(ngn(summary.total))}</strong></div></div><div className="commerce-stack">{action}</div><p className="commerce-hint" style={{ marginTop: 16 }}>Preview mode only — no payment provider, order mutation, or real charge is connected.</p></section></div>;
}
