import { DeliveryView } from "@/features/vendor/insights/vendor-insights";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function DeliveryPage() {
  const [result, areasResult] = await Promise.all([
    repositories.vendor.getDashboard(),
    repositories.delivery.getAreas(),
  ]);
  if (!result.ok) notFound();
  return (
    <DeliveryView
      zones={result.data.deliveryZones}
      pickupSettings={result.data.pickupSettings}
      availableAreas={areasResult.ok ? areasResult.data : []}
    />
  );
}
