"use client";

import { Compass, ReceiptText, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/discover", label: "Discover", icon: Compass, match: (path: string) => path === "/discover" },
  { href: "/search", label: "Search", icon: Search, match: (path: string) => path.startsWith("/search") || path.startsWith("/categories") },
  { href: "/orders", label: "Orders", icon: ReceiptText, match: (path: string) => path.startsWith("/orders") },
  { href: "/profile", label: "Profile", icon: UserRound, match: (path: string) => path.startsWith("/profile") },
] as const;

export function CustomerNavigation({ compact = false }: Readonly<{ compact?: boolean }>) {
  const pathname = usePathname();
  return (
    <nav className={cn(compact ? "mobile-nav" : "header-nav")} aria-label="Customer navigation">
      {items.map(({ href, icon: Icon, label, match }) => {
        const active = match(pathname);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            {compact ? <Icon aria-hidden="true" /> : null}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
