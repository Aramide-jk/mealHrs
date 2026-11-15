import { SettingsView } from "@/features/vendor/insights/vendor-insights";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function SettingsPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return (
    <SettingsView
      settings={result.data.settings}
      operatingSchedule={result.data.operatingSchedule}
      teamMembers={result.data.teamMembers}
    />
  );
}
