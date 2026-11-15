"use client";

import type { DeliveryEligibility, Vendor } from "@mealhrs/domain";
import { EmptyState } from "@/components/ui/empty-state";
import { useMenuPreview } from "@/lib/menu-preview-context";
import { DropControls, type DropSelection } from "./drop-controls";

export function PreviewDropDetail({ areaName, dropId, eligibility, now, vendor }: Readonly<{ areaName: string; dropId: string; eligibility: DeliveryEligibility; now: string; vendor: Vendor }>) {
  const { items, mealDrops } = useMenuPreview();
  const mealDrop = mealDrops.find((drop) => drop.id === dropId && drop.vendorId === vendor.id);
  if (!mealDrop) return <div className="page page--narrow"><EmptyState title="This pre-order batch is no longer available" description="Return to the kitchen page to see current scheduled batches." /></div>;
  const selections: readonly DropSelection[] = mealDrop.items.flatMap((selection) => {
    const item = items.find((entry) => entry.offer.id === selection.offerId && entry.dish.id === selection.dishId && !entry.archived);
    return item ? [{ dish: item.dish, offer: item.offer, quantityLimit: selection.quantityLimit }] : [];
  });
  return <div className="page"><DropControls mealDrop={mealDrop} vendor={vendor} eligibility={eligibility} selections={selections} areaName={areaName} now={now} /></div>;
}
