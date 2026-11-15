"use client";

import { Bell, ChevronDown, ExternalLink, HelpCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { useVendorWorkspace } from "@/features/vendor/vendor-workspace-context";
import { useCustomerContext } from "@/lib/customer-context";
import { VendorNavigation } from "./vendor-navigation";

export function VendorShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const { acceptsOrders, displayName, pauseImmediate, pausePreorders, slug, unreadNotifications } = useVendorWorkspace();
  const { startVendorCustomerView } = useCustomerContext();

  if (pathname === "/vendor/onboarding") {
    return (
      <main id="main-content" className="vendor-onboarding-main">
        {children}
      </main>
    );
  }

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "MK";

  const statusLabel = !acceptsOrders
    ? "Orders paused"
    : pauseImmediate && pausePreorders
      ? "Immediate & pre-orders paused"
      : pauseImmediate
        ? "Pre-orders only"
        : pausePreorders
          ? "Immediate orders only"
          : "Accepting orders";

  const statusTone = !acceptsOrders ? "paused" : pauseImmediate || pausePreorders ? "partial" : "open";

  return (
    <div className="vendor-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="vendor-sidebar">
        <Logo />
        <p className="vendor-sidebar-label">Kitchen workspace</p>
        <VendorNavigation />
        <div className="vendor-sidebar-footer">
          <Link href="/vendor/verification">
            <ShieldCheck aria-hidden="true" size={16} />
            Verification
          </Link>
          <Link href="/vendor/support">
            <HelpCircle aria-hidden="true" size={16} />
            Kitchen support
          </Link>
          <Link href={`/k/${slug}`} target="_blank">
            <ExternalLink aria-hidden="true" size={16} />
            View storefront
          </Link>
          <Link href="/vendor/settings">
            <span className="vendor-avatar" aria-hidden="true">
              {initials}
            </span>
            <span>
              {displayName}
              <small>Owner</small>
            </span>
            <ChevronDown aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <div className="vendor-main">
        <header className="vendor-header">
          <div>
            <p className="vendor-header-kicker">{displayName}</p>
            <span className="vendor-header-status" data-status={statusTone}>
              <i aria-hidden="true" />
              {statusLabel}
            </span>
          </div>
          <div className="vendor-header-actions">
            <Link
              className="icon-button vendor-bell-button"
              href="/vendor/notifications"
              aria-label={`Vendor notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ""}`}
            >
              <Bell aria-hidden="true" />
              {unreadNotifications > 0 ? <span aria-hidden="true">{unreadNotifications}</span> : null}
            </Link>
            <Link className="button button--secondary button--sm" href="/discover" onClick={startVendorCustomerView}>
              Customer view
            </Link>
          </div>
        </header>
        <main id="main-content" className="vendor-content">
          {children}
        </main>
      </div>
      <VendorNavigation compact />
    </div>
  );
}
