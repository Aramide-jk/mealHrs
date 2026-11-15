import { VendorNotificationsView } from "@/features/vendor/insights/vendor-notifications-view";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function VendorNotificationsPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return <VendorNotificationsView initialNotifications={result.data.notifications} />;
}
