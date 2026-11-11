import { StorefrontView } from "@/features/vendor/insights/vendor-insights";
import { repositories } from "@/lib/repositories";

export default async function StorefrontPage() { const result = await repositories.vendor.getDashboard(); return result.ok ? <StorefrontView storefront={result.data.storefront}/> : null; }
