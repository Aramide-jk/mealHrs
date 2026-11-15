import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import styles from "@/features/discovery/discovery.module.css";
import { VendorStorefrontMenu } from "@/features/discovery/vendor-storefront-menu";
import { areaName } from "@/features/location/area-copy";
import { getActiveAreaId } from "@/lib/active-area";
import { repositories } from "@/lib/repositories";

export default async function VendorPage({ params }: Readonly<{ params: Promise<{ vendorSlug: string }> }>) {
  const [{ vendorSlug }, activeAreaId] = await Promise.all([params, getActiveAreaId()]);
  const vendorResult = await repositories.catalog.getVendorBySlug(vendorSlug);
  if (!vendorResult.ok) notFound();
  const vendor = vendorResult.data;
  const [menuResult, dropsResult, eligibility] = await Promise.all([repositories.catalog.getVendorMenu(vendor.id), repositories.catalog.getVendorMealDrops(vendor.id), repositories.delivery.checkEligibility({ vendorId: vendor.id, areaId: activeAreaId })]);
  if (!eligibility.ok) throw new Error(eligibility.error.message);
  const location = areaName(activeAreaId);
  const now = new Date().toISOString();
  const serviceCopy = eligibility.data.status === "eligible" ? `${vendor.name} delivers to ${location}. Delivery fee ${eligibility.data.deliveryFee.amount.toLocaleString("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 })}.` : eligibility.data.status === "pickup_only" ? `${eligibility.data.reason} ${eligibility.data.pickupWindow}` : eligibility.data.reason;
  return <><section className={styles.storeHero}><Image src={vendor.coverUrl} alt={`Food prepared by ${vendor.name}`} fill priority /><div className={styles.storeHeroInner}><Status tone={vendor.acceptsOrders ? "success" : "neutral"}>{vendor.acceptsOrders ? "Accepting orders" : "Orders paused"}</Status><h1>{vendor.name} {vendor.verified ? <span className={styles.verified} aria-label="Verified">✓</span> : null}</h1><p>{vendor.category} · {vendor.publicArea} · {vendor.rating} from {vendor.reviewCount} verified orders · {vendor.fulfillmentModes.join(" and ")}</p><div className={styles.storeActions}><Button size="sm">Follow</Button><Button variant="secondary" size="sm">Share</Button></div></div></section><nav className={styles.storeTabs} aria-label="Store sections"><div><a href="#home">Home</a><a href="#menu">Menu</a><a href="#drops">Pre-orders</a><a href="#reviews">Reviews</a><a href="#about">About</a></div></nav><div className={`page ${styles.stackLg}`}><section id="home" className={styles.surface}><p className={styles.eyebrow}>Welcome</p><h2>{vendor.category === "Bakery" ? "Weekend baking, made slowly" : "Food that feels like home"}</h2><p className={styles.small}>{vendor.description}</p><Notice tone={eligibility.data.status === "outside_area" ? "warning" : "info"}>{serviceCopy}</Notice></section><VendorStorefrontMenu vendor={vendor} eligibility={eligibility.data} initialMenu={menuResult.ok ? menuResult.data.map(({ dish, offer }) => ({ dish, offer, vendor })) : []} initialDrops={dropsResult.ok ? dropsResult.data : []} now={now} /><section id="reviews" className={`${styles.surface} ${styles.storeDetails}`}><div className={styles.sectionTitle}><h2>Verified reviews</h2><strong>{vendor.rating}</strong></div><blockquote>“Carefully prepared, well packed and exactly as described.”</blockquote><p>— Teni, verified purchase</p></section><section id="about" className={`${styles.surface} ${styles.storeDetails}`}><h2>About</h2><p>{vendor.fulfillmentModes.includes("delivery") ? "Delivery-focused" : "Pickup-focused"} food business in {vendor.publicArea}. Exact private addresses are never exposed. Pickup directions appear only after an eligible pickup order.</p></section></div></>;
}
