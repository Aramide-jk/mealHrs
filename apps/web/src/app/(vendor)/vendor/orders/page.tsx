import { VendorOrdersView } from "@/features/vendor/operations/vendor-orders-view";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function VendorOrdersPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return <VendorOrdersView immediateOrders={result.data.immediateOrders} mealDropOrders={result.data.mealDropOrders}/>;
}
