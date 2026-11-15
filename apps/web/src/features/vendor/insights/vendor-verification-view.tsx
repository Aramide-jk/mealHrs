"use client";

import type { VendorPayoutAccountPreview, VendorVerificationPreview } from "@mealhrs/domain";
import { ShieldCheck, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import styles from "./vendor-insights.module.css";

export function VendorVerificationView({
  verification,
  payoutAccount,
}: Readonly<{
  verification: VendorVerificationPreview;
  payoutAccount: VendorPayoutAccountPreview;
}>) {
  const [docs, setDocs] = useState(verification.documents);
  const [feedback, setFeedback] = useState("");

  const submitDocumentPreview = (id: string, label: string) => {
    setDocs((current) =>
      current.map((doc) => (doc.id === id ? { ...doc, status: "submitted", detail: "Uploaded in frontend preview" } : doc)),
    );
    setFeedback(`${label} marked submitted in this frontend preview. Admin verification is simulated.`);
  };

  return (
    <div>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Trust &amp; compliance</p>
          <h1>Business verification</h1>
          <p>
            MealHrs separates account verification, business review, and food-safety certification so claims stay accurate.
          </p>
        </div>
        <Status tone={verification.status === "approved" ? "success" : "warning"}>
          {verification.status === "approved" ? "Approved preview" : "Review in progress"}
        </Status>
      </header>

      <div className="stack-lg">
        {feedback ? (
          <p className={styles.feedback} role="status">
            {feedback}
          </p>
        ) : null}

        <div className={styles.grid}>
          <article className={`card ${styles.metric}`}>
            <span>Account identity</span>
            <strong>{verification.accountVerified ? "Verified" : "Pending"}</strong>
            <small>Phone &amp; owner identity check</small>
          </article>
          <article className={`card ${styles.metric}`}>
            <span>Business details</span>
            <strong>{verification.businessReviewed ? "Reviewed" : "Pending"}</strong>
            <small>Category, service areas &amp; payout</small>
          </article>
          <article className={`card ${styles.metric}`}>
            <span>Food safety certification</span>
            <strong>{verification.foodSafetyCertified ? "Certified" : "Not submitted"}</strong>
            <small>Independent NAFDAC / state hygiene check</small>
          </article>
        </div>

        <Notice tone="info">
          <ShieldCheck aria-hidden="true" size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6 }} />
          {verification.reviewerNote}
        </Notice>

        <section className={`card ${styles.section}`}>
          <h2>Verification checklist</h2>
          <p>Document submissions here update preview status locally and do not transmit files.</p>
          <div>
            {docs.map((doc) => (
              <div className={styles.docRow} key={doc.id}>
                <div>
                  <strong>{doc.label}</strong>
                  <span>{doc.detail}</span>
                </div>
                <div className="cluster">
                  <Status
                    tone={
                      doc.status === "verified"
                        ? "success"
                        : doc.status === "submitted"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {doc.status}
                  </Status>
                  {doc.status === "required" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      onClick={() => submitDocumentPreview(doc.id, doc.label)}
                    >
                      <UploadCloud aria-hidden="true" size={14} />
                      Upload preview
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`card ${styles.section}`}>
          <h2>Payout account summary</h2>
          <div className={styles.facts}>
            <div className={styles.fact}>
              <span>Bank</span>
              <strong>{payoutAccount.bankName}</strong>
            </div>
            <div className={styles.fact}>
              <span>Account</span>
              <strong>
                {payoutAccount.accountNumberMasked} · {payoutAccount.accountName}
              </strong>
            </div>
            <div className={styles.fact}>
              <span>Settlement cadence</span>
              <strong>{payoutAccount.settlementSchedule}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
