import type { Metadata } from "next";
import { ProfileScreen } from "@/features/account/profile-screen";
import { repositories } from "@/lib/repositories";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const [profileResult, ordersResult] = await Promise.all([
    repositories.account.getProfile(),
    repositories.commerce.getOrders(),
  ]);

  if (!profileResult.ok || !profileResult.data) throw new Error("Customer profile unavailable");
  const activeOrder = ordersResult.ok ? (ordersResult.data.find((order) => order.fulfillmentStatus !== "delivered") ?? null) : null;
  return <ProfileScreen profile={profileResult.data} activeOrder={activeOrder} />;
}
