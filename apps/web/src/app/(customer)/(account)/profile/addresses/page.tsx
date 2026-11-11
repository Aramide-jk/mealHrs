import type { Metadata } from "next";
import { AddressesScreen } from "@/features/addresses/addresses-screen";
import { repositories } from "@/lib/repositories";

export const metadata: Metadata = { title: "Saved addresses" };

export default async function AddressesPage() {
  const result = await repositories.account.getAddresses();
  if (!result.ok) throw new Error(result.error.message);
  return <AddressesScreen initialAddresses={result.data} />;
}
