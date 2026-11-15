"use client";

import {
  BarChart3,
  BookOpen,
  ChefHat,
  CircleDollarSign,
  Film,
  HelpCircle,
  LayoutDashboard,
  MapPinned,
  Menu,
  PackageCheck,
  Settings2,
  ShieldCheck,
  Store,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const items = [
  { href: "/vendor", label: "Overview", icon: LayoutDashboard, match: (path: string) => path === "/vendor" },
  { href: "/vendor/orders", label: "Orders", icon: PackageCheck, match: (path: string) => path.startsWith("/vendor/orders") },
  { href: "/vendor/menu", label: "Menu", icon: ChefHat, match: (path: string) => path.startsWith("/vendor/menu") },
  { href: "/vendor/drops", label: "Pre-order Batches", icon: BookOpen, match: (path: string) => path.startsWith("/vendor/drops") },
  { href: "/vendor/content", label: "Content", icon: Film, match: (path: string) => path.startsWith("/vendor/content") },
  { href: "/vendor/customers", label: "Customers", icon: UsersRound, match: (path: string) => path.startsWith("/vendor/customers") },
  { href: "/vendor/delivery", label: "Delivery", icon: MapPinned, match: (path: string) => path.startsWith("/vendor/delivery") },
  { href: "/vendor/earnings", label: "Earnings", icon: CircleDollarSign, match: (path: string) => path.startsWith("/vendor/earnings") },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3, match: (path: string) => path.startsWith("/vendor/analytics") },
  { href: "/vendor/storefront", label: "Storefront", icon: Store, match: (path: string) => path.startsWith("/vendor/storefront") },
  { href: "/vendor/settings", label: "Settings", icon: Settings2, match: (path: string) => path.startsWith("/vendor/settings") },
] as const;

const mobileOverflowItems = [
  ...items.slice(4),
  { href: "/vendor/verification", label: "Verification", icon: ShieldCheck, match: (path: string) => path.startsWith("/vendor/verification") },
  { href: "/vendor/support", label: "Support", icon: HelpCircle, match: (path: string) => path.startsWith("/vendor/support") },
] as const;

export function VendorNavigation({ compact = false }: Readonly<{ compact?: boolean }>) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const moreNav = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMoreOpen(false);
      requestAnimationFrame(() => moreButton.current?.focus());
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (moreNav.current?.contains(target) || moreButton.current?.contains(target)) return;
      setMoreOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [moreOpen]);

  if (!compact) {
    return (
      <nav className="vendor-nav" aria-label="Vendor navigation">
        {items.map(({ href, icon: Icon, label, match }) => (
          <Link key={href} href={href} aria-current={match(pathname) ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    );
  }

  const primary = items.slice(0, 4);

  return (
    <>
      <nav className="vendor-mobile-nav" aria-label="Vendor navigation">
        {primary.map(({ href, icon: Icon, label, match }) => (
          <Link
            key={href}
            href={href}
            aria-current={match(pathname) ? "page" : undefined}
            onClick={() => setMoreOpen(false)}
          >
            <Icon aria-hidden="true" />
            <span>{href === "/vendor/drops" ? "Pre-order" : label}</span>
          </Link>
        ))}
        <button
          ref={moreButton}
          type="button"
          aria-expanded={moreOpen}
          aria-controls="vendor-more-navigation"
          onClick={() => setMoreOpen((open) => !open)}
        >
          {moreOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span>More</span>
        </button>
      </nav>
      {moreOpen ? (
        <nav
          ref={moreNav}
          id="vendor-more-navigation"
          className="vendor-more-nav"
          aria-label="More vendor pages"
        >
          {mobileOverflowItems.map(({ href, icon: Icon, label, match }) => (
            <Link
              key={href}
              href={href}
              aria-current={match(pathname) ? "page" : undefined}
              onClick={() => setMoreOpen(false)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      ) : null}
    </>
  );
}
