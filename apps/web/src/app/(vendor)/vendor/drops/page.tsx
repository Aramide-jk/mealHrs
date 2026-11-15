import { VendorDropsView } from "@/features/vendor/operations/vendor-drops-view";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function VendorDropsPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return (
    <VendorDropsView
      mealDrops={result.data.mealDrops}
      menu={result.data.menu}
      deliveryZones={result.data.deliveryZones}
      now={new Date().toISOString()}
    />
  );
}
