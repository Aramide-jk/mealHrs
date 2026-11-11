import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "neutral" | "danger";

export function Status({ className, tone = "success", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: StatusTone }) {
  return <span className={cn("status", `status--${tone}`, className)} {...props} />;
}
