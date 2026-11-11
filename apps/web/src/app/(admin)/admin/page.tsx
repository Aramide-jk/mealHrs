import { AdminOverviewView } from "@/features/admin/overview/admin-overview-view";
import { repositories } from "@/lib/repositories";

export default async function AdminOverviewPage() { const result = await repositories.admin.getDashboard(); return result.ok ? <AdminOverviewView snapshot={result.data}/> : <div className="admin-page"><h1>We couldn&apos;t load the control room</h1><p>Please try again shortly.</p></div>; }
