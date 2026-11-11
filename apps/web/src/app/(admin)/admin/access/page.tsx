import { AdminAccessView } from "@/features/admin/access/admin-access-view";
import { repositories } from "@/lib/repositories";

export default async function AdminAccessPage() { const result = await repositories.admin.getDashboard(); return result.ok ? <AdminAccessView snapshot={result.data}/> : <main className="admin-access"><p>We couldn&apos;t load admin access.</p></main>; }
