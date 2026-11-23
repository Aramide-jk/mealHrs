"use client";

import type { MealListing } from "@mealhrs/contracts";
import type { Vendor } from "@mealhrs/domain";
import { Sparkles, Store, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Status } from "@/components/ui/status";
import { MealCard } from "@/features/discovery/meal-card";
import { ResultRow } from "@/features/discovery/result-row";
import { SegmentedTabs, type TabItem } from "../discovery/segmented-tabs";
import styles from "../discovery/discovery.module.css";
import { useCustomerActivity } from "@/lib/customer-activity-context";

export function SavedContent({
  allMeals = [],
  allVendors = [],
  tabs: fallbackTabs,
}: Readonly<{
  allMeals?: readonly MealListing[];
  allVendors?: readonly Vendor[];
  tabs?: readonly TabItem[];
}>) {
  const { isMealSaved, isVendorSaved, toggleSaveVendor } =
    useCustomerActivity();

  const savedMeals = useMemo(
    () => allMeals.filter((m) => isMealSaved(m.dish.id) || isMealSaved(m.offer.id)),
    [allMeals, isMealSaved],
  );

  const savedVendors = useMemo(
    () => allVendors.filter((v) => isVendorSaved(v.id)),
    [allVendors, isVendorSaved],
  );

  if (fallbackTabs && allMeals.length === 0 && allVendors.length === 0) {
    return <SegmentedTabs items={fallbackTabs} />;
  }

  const dynamicTabs: readonly TabItem[] = [
    {
      id: "meals",
      label: `Meals (${savedMeals.length})`,
      panel:
        savedMeals.length > 0 ? (
          <div className={styles.dishGrid}>
            {savedMeals.map((m) => (
              <div key={m.offer.id} style={{ position: "relative" }}>
                <MealCard {...m} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<UtensilsCrossed />}
            title="No saved meals yet"
            description="Tap the bookmark icon on any dish or pre-order drop to save it to your collection."
            action={
              <Button asChild>
                <Link href="/discover">Discover meals</Link>
              </Button>
            }
          />
        ),
    },
    {
      id: "posts",
      label: "Food stories",
      panel: (
        <EmptyState
          icon={<Sparkles />}
          title="Your saved food stories live here"
          description="Save reels and cooking stories from local kitchens to revisit anytime."
          action={
            <Button asChild>
              <Link href="/discover">Watch reels</Link>
            </Button>
          }
        />
      ),
    },
    {
      id: "kitchens",
      label: `Kitchens (${savedVendors.length})`,
      panel:
        savedVendors.length > 0 ? (
          <div className={styles.resultList}>
            {savedVendors.map((vendor) => (
              <div
                key={vendor.id}
                style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12 }}
              >
                <ResultRow
                  href={`/k/${vendor.slug}`}
                  imageUrl={vendor.avatarUrl}
                  imageAlt={vendor.name}
                  title={vendor.name}
                  description={`${vendor.publicArea} · ${vendor.rating}`}
                  meta={<Status tone="success">Saved</Status>}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleSaveVendor(vendor.id)}
                  aria-label={`Remove ${vendor.name} from saved kitchens`}
                >
                  Saved ✓
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Store />}
            title="No saved kitchens yet"
            description="Bookmark food businesses from their storefront to keep track of their specialties."
            action={
              <Button asChild>
                <Link href="/search">Find kitchens</Link>
              </Button>
            }
          />
        ),
    },
  ];

  return <SegmentedTabs items={dynamicTabs} />;
}
