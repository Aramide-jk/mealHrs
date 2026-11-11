import { VendorMenuView } from "@/features/vendor/operations/vendor-menu-view";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function VendorMenuPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return <VendorMenuView menu={result.data.menu}/>;
}
