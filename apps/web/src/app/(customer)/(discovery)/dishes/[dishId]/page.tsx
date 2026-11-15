import { asDishId } from "@mealhrs/domain";
import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "@/features/discovery/discovery.module.css";
import { DishControls } from "@/features/dishes/dish-controls";
import { areaName } from "@/features/location/area-copy";
import { getActiveAreaId } from "@/lib/active-area";
import { repositories } from "@/lib/repositories";
import { PreviewDishDetail } from "@/features/dishes/preview-dish-detail";

export default async function DishPage({ params }: Readonly<{ params: Promise<{ dishId: string }> }>) {
  const [{ dishId }, activeAreaId] = await Promise.all([params, getActiveAreaId()]);
  const [result, dashboardResult] = await Promise.all([repositories.catalog.getDish(asDishId(dishId)), repositories.vendor.getDashboard()]);
  if (!result.ok) {
    if (!dashboardResult.ok) notFound();
    const eligibility = await repositories.delivery.checkEligibility({ vendorId: dashboardResult.data.vendor.id, areaId: activeAreaId });
    if (!eligibility.ok) throw new Error(eligibility.error.message);
    return <PreviewDishDetail dishId={dishId} vendor={dashboardResult.data.vendor} eligibility={eligibility.data} areaName={areaName(activeAreaId)} now={new Date().toISOString()} />;
  }
  const eligibility = await repositories.delivery.checkEligibility({ vendorId: result.data.vendor.id, areaId: activeAreaId });
  if (!eligibility.ok) throw new Error(eligibility.error.message);
  return <div className="page"><section className={styles.detailLayout}><div className={styles.detailMedia}><Image src={result.data.dish.imageUrl} alt={result.data.dish.name} width={960} height={1100} priority /></div><DishControls {...result.data} eligibility={eligibility.data} areaName={areaName(activeAreaId)} now={new Date().toISOString()} /></section></div>;
}
