"use client";

import { Bell, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { AdminNavigation } from "./admin-navigation";
import { useAdminActivity } from "@/lib/admin-activity-context";

export function AdminShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const { activeRole, emergencyKillSwitchEnabled, maintenanceBannerEnabled } = useAdminActivity();

  if (pathname === "/admin/access") return <main id="main-content" className="admin-access-main">{children}</main>;

  const initials =
    activeRole === "super_admin"
      ? "SA"
      : activeRole === "operations"
        ? "OP"
        : activeRole === "support"
          ? "CS"
          : "FA";

  const roleLabel =
    activeRole === "super_admin"
      ? "Super Admin"
      : activeRole === "operations"
        ? "Operations"
        : activeRole === "support"
          ? "Support"
          : "Finance";

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="admin-sidebar">
        <Logo />
        <p className="admin-sidebar-label">Platform workspace</p>
        <AdminNavigation />
        <div className="admin-sidebar-footer">
          <Link href="/discover" target="_blank">
            <ExternalLink aria-hidden="true" />
            Customer view
          </Link>
          <Link href="/admin/access">
            <span className="admin-avatar" aria-hidden="true">{initials}</span>
            <span>
              {roleLabel}
              <small>Switch persona</small>
            </span>
            <ChevronDown aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-header-kicker">MealHrs control room</p>
            {emergencyKillSwitchEnabled ? (
              <span className="admin-header-status" style={{ color: "#b91c1c", fontWeight: 600 }}>
                <i style={{ background: "#b91c1c" }} aria-hidden="true" />
                Emergency Pause Engaged
              </span>
            ) : maintenanceBannerEnabled ? (
              <span className="admin-header-status" style={{ color: "var(--color-green-700)", fontWeight: 600 }}>
                <i style={{ background: "var(--color-green-700)" }} aria-hidden="true" />
                Maintenance Notice Live
              </span>
            ) : (
              <span className="admin-header-status">
                <i aria-hidden="true" />
                Control Room Live
              </span>
            )}
          </div>
          <div className="admin-header-actions">
            <Link className="icon-button" href="/notifications" aria-label="Notifications">
              <Bell aria-hidden="true" />
            </Link>
            <Link className="button button--secondary button--sm" href="/vendor">
              Vendor view
            </Link>
          </div>
        </header>
        <main id="main-content" className="admin-content">
          {children}
        </main>
      </div>
      <AdminNavigation compact />
    </div>
  );
}
