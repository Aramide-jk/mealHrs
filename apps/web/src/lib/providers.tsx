"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { CustomerContextProvider } from "./customer-context";
import type { ActiveArea } from "./customer-context";
import type { AreaId } from "@mealhrs/domain";
import type { VendorDashboardSnapshot } from "@mealhrs/domain";
import { MenuPreviewProvider } from "./menu-preview-context";
import { DeliveryPreviewProvider } from "./delivery-preview-context";
import { StorefrontPreviewProvider } from "./storefront-preview-context";
import { CustomerActivityProvider } from "./customer-activity-context";
import { AdminActivityProvider } from "./admin-activity-context";

export function Providers({
  children,
  initialAreaId,
  initialAreas,
  vendorDashboard,
  initialIsVendorCustomerView = false,
}: {
  children: ReactNode;
  initialAreaId: AreaId;
  initialAreas: readonly ActiveArea[];
  vendorDashboard: VendorDashboardSnapshot | null;
  initialIsVendorCustomerView?: boolean;
}) {
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
      <CustomerContextProvider
        initialAreaId={initialAreaId}
        initialAreas={initialAreas}
        initialIsVendorCustomerView={initialIsVendorCustomerView}
      >
        <StorefrontPreviewProvider dashboard={vendorDashboard}>
          <DeliveryPreviewProvider dashboard={vendorDashboard}>
            <MenuPreviewProvider dashboard={vendorDashboard}>
              <CustomerActivityProvider>
                <AdminActivityProvider>{children}</AdminActivityProvider>
              </CustomerActivityProvider>
            </MenuPreviewProvider>
          </DeliveryPreviewProvider>
        </StorefrontPreviewProvider>
      </CustomerContextProvider>
    </QueryClientProvider>
  );
}
