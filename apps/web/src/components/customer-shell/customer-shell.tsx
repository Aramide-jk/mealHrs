"use client";

import { Bell, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CustomerNavigation } from "./customer-navigation";
import { Logo } from "@/components/ui/logo";
import { ShellLocationDialog } from "./location-dialog";
import { useCartStore } from "@/features/cart/cart-store";

const immersivePaths = ["/discover", "/auth"];
const contextualPrefixes = ["/checkout", "/auth", "/orders/confirmation", "/support/disputes", "/dishes/", "/drops/"];

export function CustomerShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0);
  const immersive = immersivePaths.includes(pathname);
  const contextual = contextualPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isProfile = pathname === "/profile";
  const isAddresses = pathname === "/profile/addresses";
  const isSettings = pathname === "/profile/settings";

  if (immersive) return <main id="main-content">{children}</main>;

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
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
