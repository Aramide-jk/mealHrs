"use client";

import {
  formatMoney,
  ngn,
  type VendorAnalyticsPreview,
} from "@mealhrs/domain";
import { Calendar, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { Fact, Metric, PageHead } from "./vendor-insights-primitives";
import styles from "./vendor-insights.module.css";

type AnalyticsTab = "overview" | "revenue" | "dishes" | "quality";
type TimeRange = "7d" | "30d" | "90d";

export function VendorAnalyticsView({
  analytics,
}: Readonly<{ analytics: VendorAnalyticsPreview }>) {
  const [range, setRange] = useState<TimeRange>("7d");
  const [tab, setTab] = useState<AnalyticsTab>("overview");

  const factor = range === "7d" ? 1 : range === "30d" ? 4 : 12;

  const totalOrders = analytics.orderCount * factor;
  const immediateOrders = analytics.immediateOrdersCount * factor;
  const mealDropOrders = analytics.mealDropOrdersCount * factor;
  const grossEstimate = ngn(analytics.averageOrderValue.amount * totalOrders);

  // Peak activity day
  const maxWeeklyValue = Math.max(...analytics.weeklyActivity.map((b) => b.value), 1);

  // Seeded top dish leaderboard
  const topDishes = useMemo(
    () => [
      {
        rank: 1,
        name: analytics.topMeal || "Jollof Rice & Chicken",
        category: "Rice & Grains",
        orders: Math.round(totalOrders * 0.48),
        sharePercent: 48,
        mode: "immediate" as const,
      },
      {
        rank: 2,
        name: "Egusi Soup with Pounded Yam",
        category: "Soups & Swallow",
        orders: Math.round(totalOrders * 0.32),
        sharePercent: 32,
        mode: "meal_drop" as const,
      },
      {
        rank: 3,
        name: "Catfish Pepper Soup",
        category: "Soups",
        orders: Math.round(totalOrders * 0.14),
        sharePercent: 14,
        mode: "immediate" as const,
      },
      {
        rank: 4,
        name: "Fried Plantain & Assorted Meat",
        category: "Sides & Extras",
        orders: Math.round(totalOrders * 0.06),
        sharePercent: 6,
        mode: "immediate" as const,
      },
    ],
    [totalOrders, analytics.topMeal],
  );

  return (
    <PageHead
      eyebrow="Performance preview"
      title="Analytics & insights"
      description={`${
        range === "7d"
          ? analytics.periodLabel
          : range === "30d"
            ? "Last 30 days (scaled preview)"
            : "Last quarter (90 days preview)"
      }. Track sales velocity, customer repeat frequency, menu leaders, and fulfillment reliability.`}
      action={
        <div className="cluster">
          <select
            aria-label="Analytics range"
            value={range}
            onChange={(event) => setRange(event.target.value as TimeRange)}
            style={{
              border: "1px solid var(--color-line)",
              borderRadius: 9,
              padding: "7px 10px",
              fontSize: "0.72rem",
              background: "var(--color-surface)",
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      }
    >
      {/* Analytics Sub-Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Analytics views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "overview"}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "revenue"}
          onClick={() => setTab("revenue")}
        >
          Sales &amp; orders
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "dishes"}
          onClick={() => setTab("dishes")}
        >
          Menu leaders
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "quality"}
          onClick={() => setTab("quality")}
        >
          Quality &amp; fulfillment
        </button>
      </div>

      {/* Top 3 Core Metrics */}
      <div className={styles.grid}>
        <Metric
          label="Total orders fulfilled"
          value={String(totalOrders)}
          detail={`${immediateOrders} immediate · ${mealDropOrders} pre-order drops`}
        />
        <Metric
          label="Average order value"
          value={formatMoney(analytics.averageOrderValue)}
          detail={`Est. GMV: ${formatMoney(grossEstimate)}`}
        />
        <Metric
          label="Customer retention"
          value={`${analytics.repeatCustomerRate}%`}
          detail={`${analytics.acceptanceRate}% order acceptance · ${analytics.completionRate}% completion`}
        />
      </div>

      {/* Tab 1: Overview */}
      {tab === "overview" ? (
        <div className={styles.analytics}>
          <section className={`card ${styles.section}`}>
            <div className="split" style={{ alignItems: "center" }}>
              <div>
                <h2>Order rhythm by day of week</h2>
                <p className="vendor-muted" style={{ margin: 0 }}>
                  Kitchen prep load and peak dispatch hours across Monday to Sunday.
                </p>
              </div>
            </div>

            <div className={styles.bars}>
              {analytics.weeklyActivity.map((bar) => {
                const isPeak = bar.value === maxWeeklyValue;
                return (
                  <div className={styles.barRow} key={bar.label}>
                    <span style={{ fontWeight: isPeak ? 600 : 400, color: isPeak ? "var(--color-ink)" : undefined }}>
                      {bar.label} {isPeak ? "🔥" : ""}
                    </span>
                    <div className={styles.bar}>
                      <i
                        style={{
                          width: `${(bar.value / maxWeeklyValue) * 100}%`,
                          backgroundColor: isPeak ? "var(--color-orange-500)" : "var(--color-green-600)",
                        }}
                      />
                    </div>
                    <strong>{Math.round((bar.value * factor) / 4) || bar.value}</strong>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={`card ${styles.section}`}>
            <h2>What is working</h2>
            <div className={styles.facts}>
              <Fact label="Best-selling meal" value={analytics.topMeal} />
              <Fact label="Busiest ordering window" value={analytics.busyWindow} />
              <Fact
                label="Top delivery neighborhoods"
                value={analytics.topAreas
                  .map((area) => `${area.name} (${area.orders * factor} orders)`)
                  .join(" · ")}
              />
              <Fact
                label="Fulfillment reliability"
                value={`${analytics.completionRate}% of orders delivered on schedule`}
              />
            </div>
          </section>
        </div>
      ) : null}

      {/* Tab 2: Sales & Revenue */}
      {tab === "revenue" ? (
        <div className="stack-lg">
          <div className={styles.grid2}>
            <section className={`card ${styles.section}`}>
              <h2>Fulfillment model revenue split</h2>
              <p className="vendor-muted">
                Immediate on-demand orders vs scheduled batch Meal Drops.
              </p>
              <div className={styles.money} style={{ marginTop: 12 }}>
                <div>
                  <div className="cluster" style={{ alignItems: "center" }}>
                    <Truck aria-hidden="true" size={14} style={{ color: "var(--color-green-600)" }} />
                    <span>Immediate orders ({immediateOrders})</span>
                  </div>
                  <strong>
                    {formatMoney(
                      ngn(Math.round(grossEstimate.amount * (immediateOrders / Math.max(1, totalOrders)))),
                    )}
                  </strong>
                </div>
                <div>
                  <div className="cluster" style={{ alignItems: "center" }}>
                    <Calendar aria-hidden="true" size={14} style={{ color: "var(--color-orange-500)" }} />
                    <span>Meal Drop pre-orders ({mealDropOrders})</span>
                  </div>
                  <strong>
                    {formatMoney(
                      ngn(Math.round(grossEstimate.amount * (mealDropOrders / Math.max(1, totalOrders)))),
                    )}
                  </strong>
                </div>
                <div className={styles.total}>
                  <span>Total gross merchandise value</span>
                  <strong>{formatMoney(grossEstimate)}</strong>
                </div>
              </div>
            </section>

            <section className={`card ${styles.section}`}>
              <h2>Basket size &amp; economics</h2>
              <div className={styles.facts} style={{ marginTop: 12 }}>
                <Fact
                  label="Average order value"
                  value={formatMoney(analytics.averageOrderValue)}
                />
                <Fact
                  label="Estimated net kitchen payout"
                  value={formatMoney(ngn(Math.round(grossEstimate.amount * 0.835)))}
                />
                <Fact
                  label="Effective platform commission"
                  value="15% standard food commission (0% on delivery)"
                />
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {/* Tab 3: Menu Leaders */}
      {tab === "dishes" ? (
        <section className={`card ${styles.section}`}>
          <div className="split" style={{ marginBottom: 14 }}>
            <div>
              <h2>Top performing dishes</h2>
              <p className="vendor-muted" style={{ margin: 0 }}>
                Ranked by customer orders and total contribution to sales.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {topDishes.map((dish) => (
              <div
                key={dish.name}
                className="split"
                style={{
                  padding: "12px 14px",
                  border: "1px solid var(--color-line)",
                  borderRadius: 10,
                  alignItems: "center",
                  background: "var(--color-surface)",
                }}
              >
                <div className="cluster" style={{ gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: dish.rank === 1 ? "var(--color-green-050)" : "var(--color-surface-soft)",
                      color: dish.rank === 1 ? "var(--color-green-700)" : "var(--color-muted)",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 600,
                      fontSize: "0.74rem",
                    }}
                  >
                    #{dish.rank}
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.78rem", display: "block" }}>{dish.name}</strong>
                    <span className="vendor-muted" style={{ fontSize: "0.66rem" }}>
                      {dish.category} · {dish.sharePercent}% of kitchen sales
                    </span>
                  </div>
                </div>

                <div className="cluster" style={{ gap: 10, alignItems: "center" }}>
                  <Status tone={dish.mode === "meal_drop" ? "warning" : "neutral"}>
                    {dish.mode === "meal_drop" ? "Pre-order Drop" : "Immediate"}
                  </Status>
                  <strong style={{ fontSize: "0.8rem", minWidth: 60, textAlign: "right" }}>
                    {dish.orders} orders
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Tab 4: Quality & Fulfillment */}
      {tab === "quality" ? (
        <div className="stack-lg">
          <div className={styles.grid2}>
            <section className={`card ${styles.section}`}>
              <h2>Fulfillment reliability signals</h2>
              <p className="vendor-muted">
                Reliability metrics that influence customer search visibility and badges.
              </p>
              <div className={styles.facts} style={{ marginTop: 12 }}>
                <Fact
                  label="Order acceptance rate"
                  value={`${analytics.acceptanceRate}% (target ≥ 95%)`}
                />
                <Fact
                  label="On-schedule completion rate"
                  value={`${analytics.completionRate}% (target ≥ 90%)`}
                />
                <Fact
                  label="Kitchen cancellation rate"
                  value="0.8% (healthy: under 2.0%)"
                />
                <Fact
                  label="Customer dispute rate"
                  value="0.2% (healthy: under 0.5%)"
                />
              </div>
            </section>

            <section className={`card ${styles.section}`}>
              <h2>Delivery neighborhood breakdown</h2>
              <p className="vendor-muted">
                Where your highest customer demand originates.
              </p>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {analytics.topAreas.map((area) => (
                  <div
                    key={area.name}
                    className="split"
                    style={{
                      padding: "10px 12px",
                      border: "1px solid var(--color-line)",
                      borderRadius: 9,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.76rem" }}>{area.name}</strong>
                      <span className="vendor-muted" style={{ display: "block", fontSize: "0.65rem" }}>
                        Active delivery coverage
                      </span>
                    </div>
                    <Status tone="success">{area.orders * factor} orders</Status>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <Notice tone="info">
            High completion rates and low cancellation ratios keep your kitchen ranked prominently on the Discover feed and search results.
          </Notice>
        </div>
      ) : null}
    </PageHead>
  );
}
