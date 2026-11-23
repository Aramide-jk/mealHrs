import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { Providers } from "@/lib/providers";
import { repositories } from "@/lib/repositories";
import { getActiveAreaId } from "@/lib/active-area";

export const metadata: Metadata = {
  title: { default: "MealHrs", template: "%s · MealHrs" },
  description: "Discover food from independent kitchens and order now or plan ahead.",
  applicationName: "MealHrs",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FCFAF5",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [areasResult, vendorDashboardResult, initialAreaId, cookieStore] = await Promise.all([
    repositories.delivery.getAreas(),
    repositories.vendor.getDashboard(),
    getActiveAreaId(),
    cookies(),
  ]);
  const initialAreas = areasResult.ok ? areasResult.data : [];
  const initialIsVendorCustomerView = cookieStore.get("mealhrs_vendor_view")?.value === "1";
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers
          initialAreaId={initialAreaId}
          initialAreas={initialAreas}
          vendorDashboard={vendorDashboardResult.ok ? vendorDashboardResult.data : null}
          initialIsVendorCustomerView={initialIsVendorCustomerView}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
