import type { ReactNode } from "react";
import { VendorShell } from "@/components/vendor-shell";

export default function VendorLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <VendorShell>{children}</VendorShell>;
}
