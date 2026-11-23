"use client";

import { Bell, Flame, ShieldCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CustomerNavigation } from "./customer-navigation";
import { Logo } from "@/components/ui/logo";
import { ShellLocationDialog } from "./location-dialog";
import { useCartStore } from "@/features/cart/cart-store";
import { useAdminActivity } from "@/lib/admin-activity-context";

const immersivePaths = ["/discover", "/auth"];
const contextualPrefixes = ["/checkout", "/auth", "/orders/confirmation", "/support/disputes", "/dishes/", "/drops/"];

export function CustomerShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const { maintenanceBannerEnabled, emergencyKillSwitchEnabled, emergencyNotice } = useAdminActivity();
  const cartCount = useCartStore((state) => state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0);
  const immersive = immersivePaths.includes(pathname);
  const contextual = contextualPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isProfile = pathname === "/profile";
  const isAddresses = pathname === "/profile/addresses";
  const isSettings = pathname === "/profile/settings";

  const renderBanner = () => {
    if (emergencyKillSwitchEnabled) {
      return (
        <aside
          role="alert"
          style={{
            background: "#991b1b",
            color: "#fff",
            padding: "8px 16px",
            textAlign: "center",
            fontSize: "0.74rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            zIndex: 100,
          }}
        >
          <Flame size={15} aria-hidden="true" />
          <span>
            <strong>Emergency platform pause:</strong> {emergencyNotice}
          </span>
        </aside>
      );
    }
    if (maintenanceBannerEnabled) {
      return (
        <aside
          role="status"
          style={{
            background: "var(--color-green-700)",
            color: "#fff",
            padding: "8px 16px",
            textAlign: "center",
            fontSize: "0.74rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            zIndex: 100,
          }}
        >
          <ShieldCheck size={15} aria-hidden="true" />
          <span>MealHrs is currently performing planned maintenance. Orders and live discovery remain operational.</span>
        </aside>
      );
    }
    return null;
  };

  if (immersive) {
    return (
      <>
        {renderBanner()}
        <main id="main-content">{children}</main>
      </>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      {renderBanner()}
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <CustomerNavigation />
          <div className="header-actions">
            {isAddresses || isSettings ? (
              <Link className="button button--secondary button--sm" href="/profile">
                {isSettings ? "Done" : "Back to profile"}
              </Link>
            ) : (
              <>
                <ShellLocationDialog />
                <Link className="icon-button" href="/notifications" aria-label="Notifications">
                  <Bell aria-hidden="true" />
                </Link>
                {!isProfile ? (
                  <Link className="icon-button icon-button--cart" href="/cart" aria-label={`Cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}>
                    <ShoppingBag aria-hidden="true" />
                    {cartCount > 0 ? <span aria-hidden="true">{cartCount}</span> : null}
                  </Link>
                ) : null}
              </>
            )}
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      {!contextual ? <CustomerNavigation compact /> : null}
    </>
  );
}
