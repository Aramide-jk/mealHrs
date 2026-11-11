import { asMealDropId } from "@mealhrs/domain";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DropControls } from "@/features/meal-drops/drop-controls";
import styles from "@/features/discovery/discovery.module.css";
import { repositories } from "@/lib/repositories";
import { getActiveAreaId } from "@/lib/active-area";
import { areaName } from "@/features/location/area-copy";

export default async function DropPage({params}:Readonly<{params:Promise<{dropId:string}>}>){const {dropId}=await params;const [result,activeAreaId]=await Promise.all([repositories.catalog.getMealDrop(asMealDropId(dropId)),getActiveAreaId()]);if(!result.ok)notFound();const [eligibility,...offers]=await Promise.all([repositories.delivery.checkEligibility({vendorId:result.data.vendor.id,areaId:activeAreaId}),...result.data.mealDrop.items.map(item=>repositories.catalog.getOffer(item.offerId))]);if(!eligibility.ok)throw new Error(eligibility.error.message);const selections=[];for(const [index,item] of result.data.mealDrop.items.entries()){const offer=offers[index];const dish=result.data.dishes.find(candidate=>candidate.id===item.dishId);if(offer?.ok&&dish)selections.push({offer:offer.data,dish,quantityLimit:item.quantityLimit});}return <div className="page"><section className={styles.detailLayout}><div className={styles.detailMedia}><Image src={result.data.mealDrop.imageUrl} alt={result.data.mealDrop.name} width={960} height={1100} priority/></div><DropControls mealDrop={result.data.mealDrop} vendor={result.data.vendor} eligibility={eligibility.data} selections={selections} areaName={areaName(activeAreaId)} now={new Date().toISOString()}/></section></div>}
