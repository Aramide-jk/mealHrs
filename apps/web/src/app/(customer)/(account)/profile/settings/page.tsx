import type { Metadata } from "next";
import { SettingsScreen } from "@/features/settings/settings-screen";
import { repositories } from "@/lib/repositories";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const result = await repositories.account.getProfile();
  if (!result.ok || !result.data) throw new Error("Customer profile unavailable");
  return <SettingsScreen profile={result.data} />;
}
