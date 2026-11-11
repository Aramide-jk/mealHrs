import { VendorOverviewView } from "@/features/vendor/overview/overview-view";
import { repositories } from "@/lib/repositories";

export default async function VendorOverviewPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) return <div className="vendor-page"><h1>We couldn&apos;t load your workspace</h1><p>Please try again shortly.</p></div>;
  return <VendorOverviewView snapshot={result.data}/>;
}
