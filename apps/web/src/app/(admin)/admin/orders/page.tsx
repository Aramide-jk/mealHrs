import { OrderReviewView } from "@/features/admin/operations/admin-operations";
import { repositories } from "@/lib/repositories";
export default async function Page(){const result=await repositories.admin.getDashboard();return result.ok?<OrderReviewView orders={result.data.orders}/>:<p>Unable to load orders.</p>;}
