"use client";

import { Bell, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { AdminNavigation } from "./admin-navigation";

export function AdminShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  if (pathname === "/admin/access") return <main id="main-content" className="admin-access-main">{children}</main>;
  return <div className="admin-shell"><a className="skip-link" href="#main-content">Skip to content</a><aside className="admin-sidebar"><Logo/><p className="admin-sidebar-label">Platform workspace</p><AdminNavigation/><div className="admin-sidebar-footer"><Link href="/discover" target="_blank"><ExternalLink aria-hidden="true"/>Customer view</Link><Link href="/admin/roles"><span className="admin-avatar" aria-hidden="true">SA</span><span>Super Admin<small>Platform access</small></span><ChevronDown aria-hidden="true"/></Link></div></aside><div className="admin-main"><header className="admin-header"><div><p className="admin-header-kicker">MealHrs control room</p><span className="admin-header-status"><i aria-hidden="true"/>Frontend preview</span></div><div className="admin-header-actions"><Link className="icon-button" href="/notifications" aria-label="Notifications"><Bell aria-hidden="true"/></Link><Link className="button button--secondary button--sm" href="/vendor">Vendor view</Link></div></header><main id="main-content" className="admin-content">{children}</main></div><AdminNavigation compact/></div>;
}
