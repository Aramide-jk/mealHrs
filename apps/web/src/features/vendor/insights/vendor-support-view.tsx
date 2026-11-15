"use client";

import type { VendorOrder } from "@mealhrs/domain";
import { Check, HelpCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import styles from "./vendor-insights.module.css";

export function VendorSupportView({ orders }: Readonly<{ orders: readonly VendorOrder[] }>) {
  const [topic, setTopic] = useState("Delivery or customer fulfillment issue");
  const [orderRef, setOrderRef] = useState(orders[0]?.reference ?? "General kitchen inquiry");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (detail.trim().length < 15) {
      setError("Please describe the issue in at least 15 characters.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Vendor operations</p>
          <h1>Kitchen support</h1>
          <p>Escalate delivery problems, order disputes, moderation questions, or payout inquiries to MealHrs.</p>
        </div>
      </header>

      <div className="stack-lg">
        {submitted ? (
          <section className={`card ${styles.section}`} role="status" aria-live="polite">
            <div className="cluster" style={{ marginBottom: 8 }}>
              <Check aria-hidden="true" size={18} />
              <h2 style={{ margin: 0 }}>Support request preview recorded</h2>
            </div>
            <p className="vendor-muted">
              Topic: {topic} ({orderRef}). No live ticket was submitted in this frontend preview.
            </p>
            <Button
              size="sm"
              variant="secondary"
              type="button"
              style={{ marginTop: 12 }}
              onClick={() => {
                setSubmitted(false);
                setDetail("");
              }}
            >
              Start another inquiry
            </Button>
          </section>
        ) : (
          <section className={`card ${styles.section}`}>
            <h2>Contact MealHrs operations</h2>
            <p>Attach an order reference when reporting a delivery issue or customer dispute.</p>
            {error ? (
              <p className={styles.errorBanner} role="alert">
                {error}
              </p>
            ) : null}
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Topic</span>
                  <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                    <option>Delivery or customer fulfillment issue</option>
                    <option>Order cancellation or refund question</option>
                    <option>Payout or settlement schedule</option>
                    <option>Content moderation appeal</option>
                    <option>Business verification help</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Related order (optional)</span>
                  <select value={orderRef} onChange={(event) => setOrderRef(event.target.value)}>
                    <option>General kitchen inquiry</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.reference}>
                        {order.reference} · {order.customer.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className={styles.field}>
                <span>Describe what happened</span>
                <textarea
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  placeholder="Share timeline details or customer communication context"
                />
              </label>
              <Notice tone="info">
                <HelpCircle aria-hidden="true" size={15} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6 }} />
                If your kitchen cannot arrange delivery for an accepted order, report it promptly rather than marking it delivered.
              </Notice>
              <div className={styles.formFoot}>
                <Button type="submit">Submit support preview</Button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
