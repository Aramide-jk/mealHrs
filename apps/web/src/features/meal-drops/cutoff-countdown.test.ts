import { describe, expect, it } from "vitest";
import { formatCutoffDate, getCutoffCountdown } from "./cutoff-countdown";

describe("getCutoffCountdown", () => {
  it("recognizes past cutoff dates and returns isPassed true", () => {
    const cutoffAt = "2026-11-07T18:00:00+01:00";
    const now = "2026-11-07T18:00:01+01:00";
    const result = getCutoffCountdown(cutoffAt, now);

    expect(result.isPassed).toBe(true);
    expect(result.isUrgent).toBe(false);
    expect(result.progressiveLabel).toBe("Cutoff passed");
    expect(result.formattedCountdown).toBe("00h : 00m : 00s");
  });

  it("calculates urgent remaining time (< 3 hours) and formats hours/minutes", () => {
    const cutoffAt = "2026-11-07T18:00:00+01:00";
    // 2 hours and 15 minutes before cutoff
    const now = "2026-11-07T15:45:00+01:00";
    const result = getCutoffCountdown(cutoffAt, now);

    expect(result.isPassed).toBe(false);
    expect(result.isUrgent).toBe(true);
    expect(result.hours).toBe(2);
    expect(result.minutes).toBe(15);
    expect(result.seconds).toBe(0);
    expect(result.formattedCountdown).toBe("02h : 15m : 00s");
    expect(result.progressiveLabel).toBe("Cutoff in 2h 15m");
  });

  it("formats minutes when under 1 hour", () => {
    const cutoffAt = "2026-11-07T18:00:00+01:00";
    const now = "2026-11-07T17:25:30+01:00";
    const result = getCutoffCountdown(cutoffAt, now);

    expect(result.isPassed).toBe(false);
    expect(result.isUrgent).toBe(true);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(34);
    expect(result.seconds).toBe(30);
    expect(result.formattedCountdown).toBe("00h : 34m : 30s");
    expect(result.progressiveLabel).toBe("Cutoff in 34m");
  });

  it("formats multi-day future cutoffs cleanly", () => {
    const cutoffAt = "2026-11-10T18:00:00+01:00";
    const now = "2026-11-07T12:00:00+01:00";
    const result = getCutoffCountdown(cutoffAt, now);

    expect(result.isPassed).toBe(false);
    expect(result.isUrgent).toBe(false);
    expect(result.days).toBe(3);
    expect(result.hours).toBe(6);
    expect(result.formattedCountdown).toBe("3d : 06h : 00m : 00s");
    expect(result.progressiveLabel).toContain("Closes Tue");
  });

  it("formats cutoff date consistently in Lagos timezone", () => {
    const cutoffAt = "2026-11-07T18:00:00+01:00";
    const formatted = formatCutoffDate(cutoffAt);
    expect(formatted).toContain("Nov");
    expect(formatted).toContain("WAT");
  });
});
