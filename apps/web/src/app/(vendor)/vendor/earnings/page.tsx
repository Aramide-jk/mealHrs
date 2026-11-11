import { EarningsView } from "@/features/vendor/insights/vendor-insights";
import { repositories } from "@/lib/repositories";

export default async function EarningsPage() { const result = await repositories.vendor.getDashboard(); return result.ok ? <EarningsView earnings={result.data.earnings}/> : null; }
