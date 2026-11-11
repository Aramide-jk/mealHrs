"use client";

import { BarChart3, BookOpen, ChefHat, CircleDollarSign, Film, LayoutDashboard, MapPinned, Menu, PackageCheck, Settings2, Store, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/vendor", label: "Overview", icon: LayoutDashboard, match: (path: string) => path === "/vendor" },
  { href: "/vendor/orders", label: "Orders", icon: PackageCheck, match: (path: string) => path.startsWith("/vendor/orders") },
  { href: "/vendor/menu", label: "Menu", icon: ChefHat, match: (path: string) => path.startsWith("/vendor/menu") },
  { href: "/vendor/drops", label: "Meal Drops", icon: BookOpen, match: (path: string) => path.startsWith("/vendor/drops") },
  { href: "/vendor/content", label: "Content", icon: Film, match: (path: string) => path.startsWith("/vendor/content") },
  { href: "/vendor/delivery", label: "Delivery", icon: MapPinned, match: (path: string) => path.startsWith("/vendor/delivery") },
  { href: "/vendor/earnings", label: "Earnings", icon: CircleDollarSign, match: (path: string) => path.startsWith("/vendor/earnings") },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3, match: (path: string) => path.startsWith("/vendor/analytics") },
  { href: "/vendor/storefront", label: "Storefront", icon: Store, match: (path: string) => path.startsWith("/vendor/storefront") },
  { href: "/vendor/settings", label: "Settings", icon: Settings2, match: (path: string) => path.startsWith("/vendor/settings") },
] as const;

export function VendorNavigation({ compact = false }: Readonly<{ compact?: boolean }>) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  if (!compact) return <nav className="vendor-nav" aria-label="Vendor navigation">{items.map(({ href, icon: Icon, label, match }) => <Link key={href} href={href} aria-current={match(pathname) ? "page" : undefined}><Icon aria-hidden="true"/><span>{label}</span></Link>)}</nav>;
  const primary = items.slice(0, 4);
  const secondary = items.slice(4);
  return <><nav className="vendor-mobile-nav" aria-label="Vendor navigation">{primary.map(({ href, icon: Icon, label, match }) => <Link key={href} href={href} aria-current={match(pathname) ? "page" : undefined} onClick={() => setMoreOpen(false)}><Icon aria-hidden="true"/><span>{label}</span></Link>)}<button type="button" aria-expanded={moreOpen} aria-controls="vendor-more-navigation" onClick={() => setMoreOpen((open) => !open)}>{moreOpen ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}<span>More</span></button></nav>{moreOpen ? <nav id="vendor-more-navigation" className="vendor-more-nav" aria-label="More vendor pages">{secondary.map(({ href, icon: Icon, label, match }) => <Link key={href} href={href} aria-current={match(pathname) ? "page" : undefined} onClick={() => setMoreOpen(false)}><Icon aria-hidden="true"/><span>{label}</span></Link>)}</nav> : null}</>;
}
