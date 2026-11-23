"use client";

import type { DeliveryEligibility, MealDrop, Vendor } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import type { MealListing } from "@mealhrs/contracts";
import { Bell, MessageCircle, MapPin, Store } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { useCustomerContext } from "@/lib/customer-context";
import { useDeliveryPreview } from "@/lib/delivery-preview-context";
import { useStorefrontPreview } from "@/lib/storefront-preview-context";
import { useCustomerActivity } from "@/lib/customer-activity-context";
import { VendorStorefrontMenu } from "./vendor-storefront-menu";
import styles from "./discovery.module.css";

export function VendorStorefrontProfile({
  vendor,
  eligibility,
  initialMenu,
  initialDrops,
  now,
  location,
}: Readonly<{
  vendor: Vendor;
  eligibility: DeliveryEligibility;
  initialMenu: readonly MealListing[];
  initialDrops: readonly MealDrop[];
  now: string;
  location: string;
}>) {
  const { activeArea } = useCustomerContext();
  const deliveryPreview = useDeliveryPreview();
  const storefrontPreview = useStorefrontPreview();
  const { isVendorFollowed, toggleFollowVendor, getVendorReviews } = useCustomerActivity();

  const followed = isVendorFollowed(vendor.id);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const dynamicReviews = getVendorReviews(vendor.id);
  const totalReviewCount = vendor.reviewCount + dynamicReviews.length;

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          setShareFeedback("Kitchen link copied to clipboard!");
          setTimeout(() => setShareFeedback(null), 3000);
        } else {
          setShareFeedback("Store link ready to share");
        }
      } catch {
        setShareFeedback("Could not copy link");
      }
    }
  };

  const isCurrentDashboardVendor = deliveryPreview.vendorId === vendor.id;
  const storefront = isCurrentDashboardVendor
    ? storefrontPreview.storefront
    : null;
  const pickup = isCurrentDashboardVendor ? deliveryPreview.pickup : null;
  const zones = isCurrentDashboardVendor ? deliveryPreview.zones : [];

  const displayName = storefront?.displayName || vendor.name;
  const coverUrl = storefront?.coverUrl || vendor.coverUrl;
  const description = storefront?.description || vendor.description;
  const bio = storefront?.bio || storefront?.description || vendor.description;
  const acceptsOrders =
    storefront?.acceptsOrders ?? vendor.acceptsOrders;

  // Fulfillment mode derived from pickup settings if this is the active preview vendor
  const isPickupEnabled = pickup
    ? pickup.mode !== "delivery"
    : vendor.fulfillmentModes.includes("pickup");
  const isDeliveryEnabled = pickup
    ? pickup.mode !== "pickup"
    : vendor.fulfillmentModes.includes("delivery");

  const fulfillmentModeLabel = pickup
    ? pickup.mode === "both"
      ? "Delivery and pickup"
      : pickup.mode === "pickup"
        ? "Pickup only"
        : "Delivery only"
    : vendor.fulfillmentModes.join(" and ");

  const activeZones = zones.filter((zone) => zone.enabled);
  const pickupAddress =
    pickup?.pickupAddress || `${displayName} Kitchen (${vendor.publicArea})`;
  const pickupLandmark = pickup?.landmark;
  const pickupWindow = pickup?.windowNote || "Daily collection window";
  const pickupNote =
    pickup?.addressNote ||
    "Exact private directions and gate instructions appear after an eligible pickup order is confirmed.";

  // Dynamic eligibility resolution for immediate orders in active area
  const immediateEligibility =
    deliveryPreview.resolve(vendor.id, activeArea.id, "immediate")
      ?.eligibility ?? eligibility;

  const serviceCopy =
    immediateEligibility.status === "eligible"
      ? `${displayName} delivers to ${location}. Delivery fee ${immediateEligibility.deliveryFee.amount.toLocaleString(
          "en-NG",
          { style: "currency", currency: "NGN", maximumFractionDigits: 0 },
        )}.`
      : immediateEligibility.status === "pickup_only"
        ? `${immediateEligibility.reason} ${immediateEligibility.pickupWindow}`
        : immediateEligibility.reason;

  return (
    <>
      <section className={styles.storeHero}>
        <Image
          src={coverUrl}
          alt={`Food prepared by ${displayName}`}
          fill
          priority
        />
        <div className={styles.storeHeroInner}>
          <Status tone={acceptsOrders ? "success" : "neutral"}>
            {acceptsOrders ? "Accepting orders" : "Orders paused"}
          </Status>
          <h1>
            {displayName}{" "}
            {vendor.verified ? (
              <span className={styles.verified} aria-label="Verified">
                ✓
              </span>
            ) : null}
          </h1>
          <p>
            {vendor.category} · {vendor.publicArea} · {vendor.rating} from{" "}
            {totalReviewCount} verified orders · {fulfillmentModeLabel}
          </p>

          {storefront?.specialtyTags && storefront.specialtyTags.length > 0 ? (
            <div className={styles.specialtyPills}>
              {storefront.specialtyTags.map((tag) => (
                <span className={styles.specialtyPill} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className={styles.storeActions}>
            <Button
              size="sm"
              variant={followed ? "secondary" : "primary"}
              onClick={() => toggleFollowVendor(vendor.id)}
              aria-pressed={followed}
            >
              {followed ? "Following ✓" : "Follow"}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleShare}>
              {shareFeedback ?? "Share"}
            </Button>
            {storefront?.whatsAppPhone ? (
              <a
                href={`https://wa.me/${storefront.whatsAppPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button button--secondary button--sm"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MessageCircle size={14} aria-hidden="true" />
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <nav className={styles.storeTabs} aria-label="Store sections">
        <div>
          <a href="#home">Home</a>
          <a href="#menu">Menu</a>
          <a href="#drops">Pre-orders</a>
          <a href="#reviews">Reviews</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <div className={`page ${styles.stackLg}`}>
        {storefront?.announcementEnabled && storefront.announcementNotice ? (
          <div className={styles.announcement} role="region" aria-label="Kitchen announcement">
            <Bell size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>
              <strong>Kitchen announcement:</strong> {storefront.announcementNotice}
            </div>
          </div>
        ) : null}

        <section id="home" className={styles.surface}>
          <p className={styles.eyebrow}>Welcome</p>
          <h2>
            {vendor.category === "Bakery"
              ? "Weekend baking, made slowly"
              : "Food that feels like home"}
          </h2>
          <p className={styles.small}>{description}</p>
          <Notice
            tone={
              immediateEligibility.status === "outside_area"
                ? "warning"
                : "info"
            }
          >
            {serviceCopy}
          </Notice>
        </section>

        <VendorStorefrontMenu
          vendor={vendor}
          eligibility={immediateEligibility}
          initialMenu={initialMenu}
          initialDrops={initialDrops}
          now={now}
        />

        <section id="reviews" className={`${styles.surface} ${styles.storeDetails}`}>
          <div className={styles.sectionTitle}>
            <h2>Verified reviews</h2>
            <strong>{vendor.rating} ★ ({totalReviewCount})</strong>
          </div>
          {dynamicReviews.map((rev) => (
            <div key={rev.id} style={{ marginBottom: 16, borderBottom: "1px solid #e2e7e3", paddingBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <strong>{rev.authorName}</strong>
                <span style={{ color: "#d97706", fontSize: "0.85rem", fontWeight: 600 }}>{"★".repeat(Math.round(rev.averageRating))} {rev.averageRating.toFixed(1)}</span>
              </div>
              <blockquote style={{ margin: "4px 0 6px" }}>“{rev.comment}”</blockquote>
              <small style={{ color: "#66736b" }}>Verified customer purchase</small>
            </div>
          ))}
          <blockquote>
            “Carefully prepared, well packed and exactly as described.”
          </blockquote>
          <p>— Teni, verified purchase</p>
        </section>

        <section id="about" className={`${styles.surface} ${styles.storeDetails}`}>
          <h2>About</h2>
          <p>{bio}</p>

          <div className={styles.aboutGrid}>
            {isDeliveryEnabled ? (
              <div className={styles.aboutCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <MapPin size={18} style={{ color: "#1f6b45" }} />
                  <h3 style={{ margin: 0 }}>Delivery coverage</h3>
                </div>
                <p style={{ margin: "0 0 10px" }}>
                  Delivery is fulfilled and dispatched directly by {displayName}.
                </p>
                {activeZones.length > 0 ? (
                  <ul className={styles.aboutList}>
                    {activeZones.map((zone) => (
                      <li key={zone.areaId}>
                        <strong>{zone.name}</strong> · {zone.estimate} · {formatMoney(zone.deliveryFee)}
                        {zone.minimumOrder.amount > 0
                          ? ` (Min order ${formatMoney(zone.minimumOrder)})`
                          : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, color: "#66736b", fontSize: "0.75rem" }}>
                    Serves {vendor.publicArea} and nearby neighborhoods.
                  </p>
                )}
              </div>
            ) : null}

            {isPickupEnabled ? (
              <div className={styles.aboutCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Store size={18} style={{ color: "#1f6b45" }} />
                  <h3 style={{ margin: 0 }}>Pickup &amp; collection</h3>
                </div>
                <p style={{ margin: "0 0 10px" }}>
                  Direct collection from the kitchen is enabled for this food business.
                </p>
                <div className={styles.aboutFacts}>
                  <div>
                    <small>Collection hours</small>
                    <strong>{pickupWindow}</strong>
                  </div>
                  <div>
                    <small>Pickup address</small>
                    <strong>{pickupAddress}</strong>
                  </div>
                  {pickupLandmark ? (
                    <div>
                      <small>Landmark</small>
                      <strong>{pickupLandmark}</strong>
                    </div>
                  ) : null}
                  <div>
                    <small>Directions &amp; privacy</small>
                    <p>{pickupNote}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.aboutCard}>
                <h3 style={{ margin: "0 0 8px" }}>Pickup policy</h3>
                <p style={{ margin: 0 }}>
                  This kitchen is delivery-only. Customer pickup is not available.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
