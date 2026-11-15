import { VendorSupportView } from "@/features/vendor/insights/vendor-support-view";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function VendorSupportPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return <VendorSupportView orders={[...result.data.immediateOrders, ...result.data.mealDropOrders]} />;
}
