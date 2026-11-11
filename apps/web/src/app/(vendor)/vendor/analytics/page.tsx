import { AnalyticsView } from "@/features/vendor/insights/vendor-insights";
import { repositories } from "@/lib/repositories";

export default async function AnalyticsPage() { const result = await repositories.vendor.getDashboard(); return result.ok ? <AnalyticsView analytics={result.data.analytics}/> : null; }
