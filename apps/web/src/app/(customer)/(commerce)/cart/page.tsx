import { notFound } from "next/navigation";
import { CartView } from "@/features/cart/cart-view";
import { repositories } from "@/lib/repositories";
import { getActiveAreaId } from "@/lib/active-area";

export default async function CartPage() {
  const [cartResult, mealsResult, activeAreaId] = await Promise.all([
    repositories.commerce.getCart(),
    repositories.catalog.listMeals(),
    getActiveAreaId(),
  ]);
  if (!mealsResult.ok) notFound();
  const vendors = [...new Map(mealsResult.data.map((entry) => [entry.vendor.id, entry.vendor])).values()];
  const feeEntries = await Promise.all(vendors.map(async (vendor) => {
    const eligibility = await repositories.delivery.checkEligibility({ vendorId: vendor.id, areaId: activeAreaId });
    return [vendor.id, eligibility.ok && eligibility.data.status === "eligible" ? eligibility.data.deliveryFee.amount : 0] as const;
  }));
  return <CartView seed={cartResult.ok ? cartResult.data : null} deliveryFees={Object.fromEntries(feeEntries)} vendors={vendors} loadError={!cartResult.ok} />;
}
