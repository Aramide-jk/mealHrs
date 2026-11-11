import { AdminDeliveryView } from "@/features/admin/governance/admin-governance";
import { repositories } from "@/lib/repositories";
export default async function Page(){const result=await repositories.admin.getDashboard();return result.ok?<AdminDeliveryView zones={result.data.deliveryZones}/>:<AdminLoadError area="delivery coverage"/>;}
function AdminLoadError({area}:{area:string}){return <div className="admin-page"><h1>We couldn&apos;t load {area}</h1><p>Please refresh this workspace or try again shortly.</p></div>}
