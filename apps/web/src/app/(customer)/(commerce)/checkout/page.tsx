import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutView } from "@/features/checkout/checkout-view";
import { repositories } from "@/lib/repositories";
import { getActiveAreaId } from "@/lib/active-area";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [cartResult, addressesResult, areasResult, mealsResult, activeAreaId] = await Promise.all([
    repositories.commerce.getCart(),
    repositories.account.getAddresses(),
    repositories.delivery.getAreas(),
    repositories.catalog.listMeals(),
    getActiveAreaId(),
  ]);
  if (!cartResult.ok || !cartResult.data || !addressesResult.ok || !areasResult.ok || !mealsResult.ok) notFound();
  const cart = cartResult.data;
  const vendors = [...new Map(mealsResult.data.map((entry) => [entry.vendor.id, entry.vendor])).values()];
  if (!vendors.some((vendor) => vendor.id === cart.vendorId)) notFound();
  const eligibilities = await Promise.all(vendors.flatMap((vendor) => areasResult.data.map(async (area) => {
    const result = await repositories.delivery.checkEligibility({ vendorId: vendor.id, areaId: area.id });
    if (!result.ok) notFound();
    return { vendorId: vendor.id, areaId: area.id, eligibility: result.data };
  })));
  return <CheckoutView activeAreaId={activeAreaId} addresses={addressesResult.data} areas={areasResult.data} eligibilities={eligibilities} seed={cart} vendors={vendors} />;
}
