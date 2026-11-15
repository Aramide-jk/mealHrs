"use client";

import type { DeliveryEligibility, Vendor } from "@mealhrs/domain";
import { EmptyState } from "@/components/ui/empty-state";
import { useMenuPreview } from "@/lib/menu-preview-context";
import { DishControls } from "./dish-controls";

export function PreviewDishDetail({ areaName, dishId, eligibility, now, vendor }: Readonly<{ areaName: string; dishId: string; eligibility: DeliveryEligibility; now: string; vendor: Vendor }>) {
  const { items } = useMenuPreview();
  const item = items.find((entry) => entry.dish.id === dishId && entry.dish.vendorId === vendor.id);
  if (!item) return <div className="page page--narrow"><EmptyState title="This preview dish is no longer available" description="Return to the kitchen menu to see the current dishes." /></div>;
  return <div className="page"><DishControls dish={item.dish} offer={item.offer} vendor={vendor} eligibility={eligibility} areaName={areaName} now={now} /></div>;
}
