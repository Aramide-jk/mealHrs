"use client";

import { BarChart3, BadgeCheck, ClipboardList, FileText, Landmark, LayoutDashboard, MapPinned, Menu, ReceiptText, Settings2, ShieldCheck, UserRound, UsersRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, match: (path: string) => path === "/admin" },
  { href: "/admin/vendors", label: "Vendors", icon: BadgeCheck, match: (path: string) => path.startsWith("/admin/vendors") },
  { href: "/admin/customers", label: "Customers", icon: UsersRound, match: (path: string) => path.startsWith("/admin/customers") },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText, match: (path: string) => path.startsWith("/admin/orders") },
  { href: "/admin/disputes", label: "Disputes", icon: ClipboardList, match: (path: string) => path.startsWith("/admin/disputes") },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldCheck, match: (path: string) => path.startsWith("/admin/moderation") },
  { href: "/admin/delivery", label: "Delivery", icon: MapPinned, match: (path: string) => path.startsWith("/admin/delivery") },
  { href: "/admin/finance", label: "Finance", icon: Landmark, match: (path: string) => path.startsWith("/admin/finance") },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, match: (path: string) => path.startsWith("/admin/analytics") },
  { href: "/admin/roles", label: "Roles", icon: UserRound, match: (path: string) => path.startsWith("/admin/roles") },
  { href: "/admin/audit", label: "Audit log", icon: FileText, match: (path: string) => path.startsWith("/admin/audit") },
  { href: "/admin/settings", label: "Settings", icon: Settings2, match: (path: string) => path.startsWith("/admin/settings") },
] as const;

export function AdminNavigation({ compact = false }: Readonly<{ compact?: boolean }>) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const dismissMenu = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMoreOpen(false);
      requestAnimationFrame(() => moreButton.current?.focus());
    };
    window.addEventListener("keydown", dismissMenu);
    return () => window.removeEventListener("keydown", dismissMenu);
  }, [moreOpen]);
  if (!compact) return <nav className="admin-nav" aria-label="Admin navigation">{items.map(({ href, icon: Icon, label, match }) => <Link href={href} key={href} aria-current={match(pathname) ? "page" : undefined}><Icon aria-hidden="true"/><span>{label}</span></Link>)}</nav>;
  const primary = items.slice(0, 4);
  const secondary = items.slice(4);
  return <><nav className="admin-mobile-nav" aria-label="Admin navigation">{primary.map(({ href, icon: Icon, label, match }) => <Link href={href} key={href} aria-current={match(pathname) ? "page" : undefined} onClick={() => setMoreOpen(false)}><Icon aria-hidden="true"/><span>{label}</span></Link>)}<button ref={moreButton} type="button" aria-expanded={moreOpen} aria-controls="admin-more-navigation" onClick={() => setMoreOpen((open) => !open)}>{moreOpen ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}<span>More</span></button></nav>{moreOpen ? <nav id="admin-more-navigation" className="admin-more-nav" aria-label="More admin pages">{secondary.map(({ href, icon: Icon, label, match }) => <Link href={href} key={href} aria-current={match(pathname) ? "page" : undefined} onClick={() => setMoreOpen(false)}><Icon aria-hidden="true"/><span>{label}</span></Link>)}</nav> : null}</>;
}
