import { VendorReviewView } from "@/features/admin/operations/admin-operations";
import { repositories } from "@/lib/repositories";
export default async function Page(){const result=await repositories.admin.getDashboard();return result.ok?<VendorReviewView vendors={result.data.vendors}/>:<p>Unable to load vendor reviews.</p>;}
