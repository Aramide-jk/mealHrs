import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type NoticeTone = "info" | "warning" | "danger" | "success";

export function Notice({ children, className, tone = "info", ...props }: HTMLAttributes<HTMLDivElement> & { tone?: NoticeTone }) {
  const Icon = tone === "success" ? CircleCheck : tone === "info" ? Info : CircleAlert;
  return (
    <div className={cn("notice", `notice--${tone}`, className)} role={tone === "danger" ? "alert" : "status"} {...props}>
      <Icon aria-hidden="true" size={17} />
      <div>{children}</div>
    </div>
  );
}
