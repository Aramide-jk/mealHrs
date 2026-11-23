"use client";

import type { Vendor } from "@mealhrs/domain";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Status } from "@/components/ui/status";
import { ResultRow } from "./result-row";
import styles from "./discovery.module.css";
import { useCustomerActivity } from "@/lib/customer-activity-context";

export function FollowingContent({
  allVendors,
}: Readonly<{
  allVendors: readonly Vendor[];
}>) {
  const { toggleFollowVendor, isVendorFollowed } = useCustomerActivity();

  const followedVendors = allVendors.filter((v) => isVendorFollowed(v.id));

  if (followedVendors.length === 0) {
    return (
      <EmptyState
        title="No followed kitchens yet"
        description="Follow kitchens from search or their storefront to build a personal food feed."
        action={
          <Button asChild>
            <Link href="/search">Find kitchens</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className={styles.resultList}>
      {followedVendors.map((vendor) => (
        <div key={vendor.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12 }}>
          <ResultRow
            href={`/k/${vendor.slug}`}
            imageUrl={vendor.avatarUrl}
            imageAlt={vendor.name}
            title={vendor.name}
            description={`${vendor.publicArea} · ${vendor.acceptsOrders ? "Available now" : "Paused"} · ${vendor.rating}`}
            meta={
              <Status tone={vendor.acceptsOrders ? "success" : "neutral"}>
                {vendor.acceptsOrders ? "New menu today" : "Orders paused"}
              </Status>
            }
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleFollowVendor(vendor.id)}
            aria-label={`Unfollow ${vendor.name}`}
          >
            Following ✓
          </Button>
        </div>
      ))}
    </div>
  );
}
