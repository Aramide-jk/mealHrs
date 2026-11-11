import { AdminRolesView } from "@/features/admin/governance/admin-governance";
import { repositories } from "@/lib/repositories";
export default async function Page(){const result=await repositories.admin.getDashboard();return result.ok?<AdminRolesView roles={result.data.roles}/>:<AdminLoadError area="roles and access"/>;}
function AdminLoadError({area}:{area:string}){return <div className="admin-page"><h1>We couldn&apos;t load {area}</h1><p>Please refresh this workspace or try again shortly.</p></div>}
