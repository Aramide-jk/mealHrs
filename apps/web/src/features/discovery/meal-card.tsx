import type { Dish, MenuOffer, Vendor } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import Image from "next/image";
import Link from "next/link";
import { Status } from "@/components/ui/status";
import styles from "./discovery.module.css";
import { isCutoffPassed } from "@/features/meal-drops/effective-availability";

export function MealCard({ dish, now, offer, vendor }: Readonly<{ dish: Dish; now?: string; offer: MenuOffer; vendor?: Vendor }>) {
  const preorder = offer.orderingMode === "meal_drop";
  const cutoffPassed = offer.availability.status === "preorder" && Boolean(now) && isCutoffPassed(offer.availability.cutoffAt, now!);
  const href = preorder && offer.mealDropId ? `/drops/${offer.mealDropId}` : `/dishes/${dish.id}`;
  return (
    <article className={styles.dishCard}>
      <Link href={href}>
        <Image src={dish.imageUrl} alt={dish.name} width={720} height={540} sizes="(max-width: 600px) 50vw, 33vw" />
        <div className={styles.dishBody}>
          <h3>{dish.name}</h3>
          <p>{vendor ? `${vendor.name} · ` : ""}{offer.availability.status === "available_now" ? offer.availability.preparationEstimate : offer.availability.status === "preorder" ? offer.availability.fulfillmentWindow : offer.availability.reason}</p>
          <div className={styles.split}>
            <strong className={styles.price}>{formatMoney(offer.price)}</strong>
            <Status tone={preorder && !cutoffPassed ? "warning" : cutoffPassed || offer.availability.status === "unavailable" ? "neutral" : "success"}>
              {cutoffPassed ? "Cutoff passed" : preorder ? "Pre-order" : offer.availability.status === "unavailable" ? "Unavailable" : "Available now"}
            </Status>
          </div>
        </div>
      </Link>
    </article>
  );
}
