import { useEffect, useState } from "react";

export type CutoffCountdown = Readonly<{
  isPassed: boolean;
  isUrgent: boolean;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string;
  progressiveLabel: string;
  cutoffDateFormatted: string;
}>;

export function formatCutoffDate(cutoffAt: string, timezone = "Africa/Lagos"): string {
  try {
    const date = new Date(cutoffAt);
    if (Number.isNaN(date.getTime())) return cutoffAt;
    return new Intl.DateTimeFormat("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(date) + " WAT";
  } catch {
    return cutoffAt;
  }
}

export function getCutoffCountdown(cutoffAt: string, nowInput?: string | Date): CutoffCountdown {
  const target = new Date(cutoffAt).getTime();
  const now = nowInput instanceof Date ? nowInput.getTime() : nowInput ? new Date(nowInput).getTime() : Date.now();
  const diffMs = target - now;

  const cutoffDateFormatted = formatCutoffDate(cutoffAt);

  if (Number.isNaN(target) || diffMs <= 0) {
    return {
      isPassed: true,
      isUrgent: false,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedCountdown: "00h : 00m : 00s",
      progressiveLabel: "Cutoff passed",
      cutoffDateFormatted,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const totalHours = Math.floor(totalSeconds / 3600);

  const isUrgent = totalHours < 3;

  const pad = (n: number) => String(n).padStart(2, "0");
  const formattedCountdown = days > 0
    ? `${days}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`
    : `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;

  let progressiveLabel: string;
  if (totalHours < 1) {
    progressiveLabel = `Cutoff in ${Math.max(1, minutes)}m`;
  } else if (totalHours < 3) {
    progressiveLabel = `Cutoff in ${totalHours}h ${minutes}m`;
  } else if (totalHours < 24) {
    progressiveLabel = `Cutoff in ${totalHours}h`;
  } else {
    try {
      const cutoffDate = new Date(cutoffAt);
      const weekday = new Intl.DateTimeFormat("en-NG", { weekday: "short", timeZone: "Africa/Lagos" }).format(cutoffDate);
      const timeStr = new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" }).format(cutoffDate);
      progressiveLabel = `Closes ${weekday}, ${timeStr}`;
    } catch {
      progressiveLabel = `Cutoff in ${days}d`;
    }
  }

  return {
    isPassed: false,
    isUrgent,
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    formattedCountdown,
    progressiveLabel,
    cutoffDateFormatted,
  };
}

export function useCutoffCountdown(cutoffAt: string, initialNow?: string): CutoffCountdown {
  const [countdown, setCountdown] = useState<CutoffCountdown>(() => getCutoffCountdown(cutoffAt, initialNow));

  useEffect(() => {
    // If the cutoff has already passed, no live interval is needed
    if (countdown.isPassed) return;

    const interval = setInterval(() => {
      const next = getCutoffCountdown(cutoffAt);
      setCountdown(next);
      if (next.isPassed) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cutoffAt, countdown.isPassed]);

  return countdown;
}
