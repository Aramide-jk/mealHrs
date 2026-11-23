import { notFound } from "next/navigation";
import { VendorStorefrontProfile } from "@/features/discovery/vendor-storefront-profile";
import { areaName } from "@/features/location/area-copy";
import { getActiveAreaId } from "@/lib/active-area";
import { repositories } from "@/lib/repositories";

export default async function VendorPage({ params }: Readonly<{ params: Promise<{ vendorSlug: string }> }>) {
  const [{ vendorSlug }, activeAreaId] = await Promise.all([params, getActiveAreaId()]);
  const vendorResult = await repositories.catalog.getVendorBySlug(vendorSlug);
  if (!vendorResult.ok) notFound();
  const vendor = vendorResult.data;
  const [menuResult, dropsResult, eligibility] = await Promise.all([
    repositories.catalog.getVendorMenu(vendor.id),
    repositories.catalog.getVendorMealDrops(vendor.id),
    repositories.delivery.checkEligibility({ vendorId: vendor.id, areaId: activeAreaId }),
  ]);
  if (!eligibility.ok) throw new Error(eligibility.error.message);
  const location = areaName(activeAreaId);
  const now = new Date().toISOString();

  return (
    <VendorStorefrontProfile
      vendor={vendor}
      eligibility={eligibility.data}
      initialMenu={menuResult.ok ? menuResult.data.map(({ dish, offer }) => ({ dish, offer, vendor })) : []}
      initialDrops={dropsResult.ok ? dropsResult.data : []}
      now={now}
      location={location}
    />
  );
}
