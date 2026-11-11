import { DisputesView } from "@/features/admin/operations/admin-operations";
import { repositories } from "@/lib/repositories";
export default async function Page(){const result=await repositories.admin.getDashboard();return result.ok?<DisputesView disputes={result.data.disputes}/>:<p>Unable to load disputes.</p>;}
