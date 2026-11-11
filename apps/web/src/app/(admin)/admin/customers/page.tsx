import { CustomerReviewView } from "@/features/admin/operations/admin-operations";
import { repositories } from "@/lib/repositories";
export default async function Page(){const result=await repositories.admin.getDashboard();return result.ok?<CustomerReviewView customers={result.data.customers}/>:<p>Unable to load customers.</p>;}
