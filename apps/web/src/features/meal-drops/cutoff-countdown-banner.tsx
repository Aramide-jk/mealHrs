"use client";

import { useCutoffCountdown } from "./cutoff-countdown";
import styles from "../discovery/discovery.module.css";

export function CutoffCountdownBanner({
  cutoffAt,
  initialNow,
  fulfillmentDate,
  fulfillmentWindow,
  remainingCapacity,
  capacity,
}: Readonly<{
  cutoffAt: string;
  initialNow?: string | undefined;
  fulfillmentDate: string;
  fulfillmentWindow: string;
  remainingCapacity: number;
  capacity: number;
}>) {
  const { isPassed, isUrgent, formattedCountdown, cutoffDateFormatted } = useCutoffCountdown(cutoffAt, initialNow);

  return (
    <div
      className={`${styles.dropBanner} ${isPassed ? styles.dropBannerPassed : isUrgent ? styles.dropBannerUrgent : ""}`}
      role="status"
    >
      <div className={styles.countdownRow}>
        <span className={styles.countdownIcon} aria-hidden="true">
          {isPassed ? "🔒" : "⏳"}
        </span>
        <div>
          <div className={styles.countdownTitle}>
            {isPassed ? "Order cutoff has passed" : isUrgent ? "Order cutoff closing soon!" : "Order cutoff closes in:"}
          </div>
          {!isPassed ? (
            <div className={styles.countdownTimer} aria-label={`Time remaining: ${formattedCountdown}`}>
              {formattedCountdown}
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.dropSub}>
        <strong>Order cutoff:</strong> {cutoffDateFormatted}
        <br />
        {fulfillmentDate} · {fulfillmentWindow} WAT · {remainingCapacity} of {capacity} spaces remain.
      </div>
    </div>
  );
}
