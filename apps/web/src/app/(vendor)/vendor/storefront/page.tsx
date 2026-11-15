import { StorefrontView } from "@/features/vendor/insights/vendor-insights";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function StorefrontPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return <StorefrontView storefront={result.data.storefront} />;
}
