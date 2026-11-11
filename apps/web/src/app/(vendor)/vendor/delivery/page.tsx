import { DeliveryView } from "@/features/vendor/insights/vendor-insights";
import { repositories } from "@/lib/repositories";

export default async function DeliveryPage() { const result = await repositories.vendor.getDashboard(); return result.ok ? <DeliveryView zones={result.data.deliveryZones}/> : null; }
