import type { ReactNode } from "react";
import { CustomerShell } from "@/components/customer-shell";

export default function CustomerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <CustomerShell>{children}</CustomerShell>;
}
