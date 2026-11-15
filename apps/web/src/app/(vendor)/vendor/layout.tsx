import type { ReactNode } from "react";
import { VendorShell } from "@/components/vendor-shell";
import { VendorWorkspaceProvider } from "@/features/vendor/vendor-workspace-context";
import { repositories } from "@/lib/repositories";

export default async function VendorLayout({ children }: Readonly<{ children: ReactNode }>) {
  const result = await repositories.vendor.getDashboard();
  const initial = result.ok
    ? {
        displayName: result.data.storefront.displayName,
        slug: result.data.storefront.slug,
        publicArea: result.data.storefront.publicArea,
        acceptsOrders: result.data.storefront.acceptsOrders,
        pauseImmediate: result.data.operatingSchedule.pauseImmediate,
        pausePreorders: result.data.operatingSchedule.pausePreorders,
        unreadNotifications: result.data.notifications.filter((item) => item.unread).length,
      }
    : undefined;

  return (
    <VendorWorkspaceProvider {...(initial ? { initial } : {})}>
      <VendorShell>{children}</VendorShell>
    </VendorWorkspaceProvider>
  );
}
