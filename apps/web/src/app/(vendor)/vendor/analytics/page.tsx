import { AnalyticsView } from "@/features/vendor/insights/vendor-insights";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function AnalyticsPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return <AnalyticsView analytics={result.data.analytics} />;
}
