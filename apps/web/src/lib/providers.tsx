"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { CustomerContextProvider } from "./customer-context";
import type { ActiveArea } from "./customer-context";
import type { AreaId } from "@mealhrs/domain";
import type { VendorDashboardSnapshot } from "@mealhrs/domain";
import { MenuPreviewProvider } from "./menu-preview-context";
import { DeliveryPreviewProvider } from "./delivery-preview-context";

export function Providers({ children, initialAreaId, initialAreas, vendorDashboard }: { children: ReactNode; initialAreaId: AreaId; initialAreas: readonly ActiveArea[]; vendorDashboard: VendorDashboardSnapshot | null }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CustomerContextProvider initialAreaId={initialAreaId} initialAreas={initialAreas}>
        <DeliveryPreviewProvider dashboard={vendorDashboard}><MenuPreviewProvider dashboard={vendorDashboard}>{children}</MenuPreviewProvider></DeliveryPreviewProvider>
      </CustomerContextProvider>
    </QueryClientProvider>
  );
}
