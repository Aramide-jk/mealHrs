import { VendorCustomersView } from "@/features/vendor/insights/vendor-customers-view";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function VendorCustomersPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return <VendorCustomersView customers={result.data.customers} />;
}
