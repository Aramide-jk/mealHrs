import { ModerationView } from "@/features/admin/operations/admin-operations";
import { repositories } from "@/lib/repositories";
export default async function Page(){const result=await repositories.admin.getDashboard();return result.ok?<ModerationView items={result.data.moderation}/>:<p>Unable to load moderation queue.</p>;}
