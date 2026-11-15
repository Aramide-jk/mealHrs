"use client";

import type { VendorDashboardSnapshot } from "@mealhrs/domain";
import { formatMoney } from "@mealhrs/domain";
import {
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Film,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { useVendorWorkspace } from "../vendor-workspace-context";

export function VendorOverviewView({ snapshot }: Readonly<{ snapshot: VendorDashboardSnapshot }>) {
  const { acceptsOrders, displayName, pauseImmediate, pausePreorders, setAcceptsOrders } = useVendorWorkspace();
  const firstName = displayName.split("'")[0]?.split(/\s+/)[0] ?? snapshot.vendor.name;

  const cards = [
    {
      label: "Today’s sales",
      value: formatMoney(snapshot.overview.todaySales),
      hint: "Frontend preview",
      icon: CircleDollarSign,
    },
    {
      label: "Needs attention",
      value: String(snapshot.overview.openImmediateOrders),
      hint: `${snapshot.overview.outstandingDeliveries} outstanding delivery`,
      icon: ClipboardList,
    },
    {
      label: "Upcoming drops",
      value: String(snapshot.overview.upcomingMealDrops),
      hint: "Pre-order planning",
      icon: CalendarDays,
    },
    {
      label: "Active stories",
      value: String(snapshot.overview.activePosts),
      hint: "Food content",
      icon: Film,
    },
  ] as const;

  const nextOrder =
    snapshot.immediateOrders.find((order) => order.orderStatus === "pending_vendor") ??
    snapshot.immediateOrders.find((order) => order.fulfillmentStatus !== "delivered") ??
    snapshot.immediateOrders[0];

  const verificationComplete =
    snapshot.verification.accountVerified &&
    snapshot.verification.businessReviewed &&
    snapshot.verification.foodSafetyCertified;

  const effectiveOpen = acceptsOrders && !pauseImmediate;

  return (
    <div className="vendor-page">
      <header className="vendor-page-head">
        <div>
          <p className="vendor-eyebrow">Welcome back, {firstName}</p>
          <h1>Kitchen overview</h1>
          <p>Keep today&apos;s service calm, clear and on time.</p>
        </div>
        <div className="vendor-presence">
          <Status tone={acceptsOrders ? "success" : "neutral"}>
            {acceptsOrders ? "Accepting orders" : "Orders paused"}
          </Status>
          <Button size="sm" variant="secondary" onClick={() => setAcceptsOrders(!acceptsOrders)}>
            {acceptsOrders ? "Pause orders" : "Resume orders"}
          </Button>
        </div>
      </header>

      {!verificationComplete ? (
        <Notice tone="info">
          <strong>Account &amp; business reviewed · Food hygiene optional</strong>
          <br />
          Complete optional food-safety documentation or revisit setup steps anytime in{" "}
          <Link href="/vendor/verification">
            <u>Verification</u>
          </Link>{" "}
          or{" "}
          <Link href="/vendor/onboarding">
            <u>Kitchen setup</u>
          </Link>
          .
        </Notice>
      ) : null}

      <section className="vendor-metrics" aria-label="Kitchen performance">
        {cards.map(({ hint, icon: Icon, label, value }) => (
          <article className="vendor-metric" key={label}>
            <span className="vendor-metric-icon">
              <Icon aria-hidden="true" />
            </span>
            <p>{label}</p>
            <strong>{value}</strong>
            <small>{hint}</small>
          </article>
        ))}
      </section>

      <div className="vendor-overview-grid">
        <section className="vendor-panel">
          <div className="vendor-panel-head">
            <div>
              <p className="vendor-eyebrow">Next action</p>
              <h2>{nextOrder ? `Order ${nextOrder.reference}` : "No orders need attention"}</h2>
            </div>
            <Link href="/vendor/orders" aria-label="View all orders">
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          {nextOrder ? (
            <>
              <div className="vendor-order-summary">
                <div>
                  <strong>{nextOrder.customer.name}</strong>
                  <span>{nextOrder.items.map((item) => `${item.quantity}× ${item.name}`).join(" · ")}</span>
                </div>
                <Status tone={nextOrder.orderStatus === "pending_vendor" ? "warning" : "success"}>
                  {nextOrder.orderStatus.replaceAll("_", " ")}
                </Status>
              </div>
              <p className="vendor-muted">
                {nextOrder.fulfillmentMode === "delivery" ? "Delivery" : "Pickup"} · {nextOrder.fulfillmentWindow}
              </p>
              <Button asChild block>
                <Link href="/vendor/orders">Review order</Link>
              </Button>
            </>
          ) : null}
        </section>

        <section className="vendor-panel">
          <div className="vendor-panel-head">
            <div>
              <p className="vendor-eyebrow">Storefront</p>
              <h2>What customers see</h2>
            </div>
            <Link href="/vendor/storefront" aria-label="Edit storefront">
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="vendor-storefront-preview">
            <Store aria-hidden="true" />
            <div>
              <strong>{displayName}</strong>
              <span>
                {snapshot.storefront.publicArea} ·{" "}
                {!acceptsOrders
                  ? "Paused"
                  : pauseImmediate && pausePreorders
                    ? "Paused by schedule"
                    : effectiveOpen
                      ? "Open now"
                      : "Pre-orders only"}
              </span>
            </div>
          </div>
          <p className="vendor-muted">
            Review your public description, availability, and ordering details before customers see them.
          </p>
          <Button asChild variant="secondary" block>
            <Link href="/vendor/storefront">Preview storefront</Link>
          </Button>
        </section>

        <section className="vendor-panel">
          <div className="vendor-panel-head">
            <div>
              <p className="vendor-eyebrow">Scheduled batch &amp; delivery</p>
              <h2>Upcoming commitments</h2>
            </div>
            <Link href="/vendor/drops" aria-label="Manage pre-order batches">
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="vendor-order-summary">
            <div>
              <strong>{snapshot.overview.nextCutoffLabel}</strong>
              <span>
                {snapshot.mealDropOrders.length} active pre-order ·{" "}
                {snapshot.mealDropOrders.reduce(
                  (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
                  0,
                )}{" "}
                portions scheduled
              </span>
            </div>
            <Status tone={pausePreorders ? "neutral" : "warning"}>
              {pausePreorders ? "Pre-orders paused" : "Scheduled"}
            </Status>
          </div>
          <p className="vendor-muted">
            <Truck aria-hidden="true" style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6 }} size={14} />
            {snapshot.overview.outstandingDeliveries} active vendor-managed delivery commitment today.
          </p>
          <Button asChild variant="secondary" block>
            <Link href="/vendor/orders">Open batch prep &amp; queue</Link>
          </Button>
        </section>

        <section className="vendor-panel">
          <div className="vendor-panel-head">
            <div>
              <p className="vendor-eyebrow">Recent activity</p>
              <h2>Latest updates</h2>
            </div>
            <Link href="/vendor/notifications" aria-label="View vendor notifications">
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <ul className="vendor-activity-list">
            {snapshot.overview.recentActivity.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <small>{item.timeLabel}</small>
              </li>
            ))}
          </ul>
          <Button asChild variant="ghost" size="sm">
            <Link href="/vendor/verification">
              <ShieldCheck aria-hidden="true" size={15} />
              View verification &amp; compliance status
            </Link>
          </Button>
        </section>
      </div>

      <section className="vendor-panel vendor-quick-panel">
        <div>
          <p className="vendor-eyebrow">Quick actions</p>
          <h2>Manage today</h2>
        </div>
        <div className="vendor-quick-actions">
          <Link href="/vendor/menu">
            Update menu
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/vendor/drops">
            Plan a pre-order batch
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/vendor/content">
            Create a food story
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <p className="vendor-preview-note">
        All operational changes in this workspace are frontend previews. No customer order, payout, or storefront data is changed.
      </p>
    </div>
  );
}
