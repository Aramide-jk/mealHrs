import { SettingsView } from "@/features/vendor/insights/vendor-insights";
import { repositories } from "@/lib/repositories";

export default async function SettingsPage() { const result = await repositories.vendor.getDashboard(); return result.ok ? <SettingsView settings={result.data.settings}/> : null; }
