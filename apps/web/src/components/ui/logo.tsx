import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ inverse = false, mark = true, className }: Readonly<{ inverse?: boolean; mark?: boolean; className?: string }>) {
  return (
    <Link className={cn("brand", inverse && "brand--inverse", className)} href="/discover" aria-label="MealHrs home">
      {mark ? <span aria-hidden="true" className="brand__mark" /> : null}
      <span>mealhrs</span>
    </Link>
  );
}
