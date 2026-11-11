"use client";

import { Bell, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { VendorNavigation } from "./vendor-navigation";

export function VendorShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const onboarding = pathname === "/vendor/onboarding";
  if (onboarding) return <main id="main-content" className="vendor-onboarding-main">{children}</main>;
  return <div className="vendor-shell"><a className="skip-link" href="#main-content">Skip to content</a><aside className="vendor-sidebar"><Logo/><p className="vendor-sidebar-label">Kitchen workspace</p><VendorNavigation/><div className="vendor-sidebar-footer"><Link href="/k/amakas-kitchen" target="_blank"><ExternalLink aria-hidden="true"/>View storefront</Link><Link href="/vendor/settings"><span className="vendor-avatar" aria-hidden="true">AK</span><span>Amaka&apos;s Kitchen<small>Owner</small></span><ChevronDown aria-hidden="true"/></Link></div></aside><div className="vendor-main"><header className="vendor-header"><div><p className="vendor-header-kicker">Amaka&apos;s Kitchen</p><span className="vendor-header-status"><i aria-hidden="true"/>Accepting orders</span></div><div className="vendor-header-actions"><Link className="icon-button" href="/notifications" aria-label="Notifications"><Bell aria-hidden="true"/></Link><Link className="button button--secondary button--sm" href="/discover">Customer view</Link></div></header><main id="main-content" className="vendor-content">{children}</main></div><VendorNavigation compact/></div>;
}
