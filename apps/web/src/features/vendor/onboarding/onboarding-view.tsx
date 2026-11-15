"use client";

import type { VendorDashboardSnapshot } from "@mealhrs/domain";
import { Check, ChevronDown, ChevronRight, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

type StepId = "profile" | "fulfillment" | "payout_preview" | "first_menu";

const steps: readonly { id: StepId; title: string; detail: string }[] = [
  { id: "profile", title: "Tell customers about your kitchen", detail: "Name, category, slug, public area and food story." },
  { id: "fulfillment", title: "Set up delivery and pickup", detail: "Choose base location, supported delivery areas and hours." },
  { id: "payout_preview", title: "Review verification and payout preview", detail: "Understand identity, food-safety and settlement checks." },
  { id: "first_menu", title: "Add your first meal", detail: "Configure an immediate dish or a scheduled pre-order batch." },
] as const;

export function OnboardingView({ snapshot }: Readonly<{ snapshot: VendorDashboardSnapshot }>) {
  const [completed, setCompleted] = useState<Set<StepId>>(() => new Set(snapshot.onboarding.completedSteps));
  const [activeStep, setActiveStep] = useState<StepId | null>(null);
  const [draftSavedMessage, setDraftSavedMessage] = useState("");
  const [submittedPreview, setSubmittedPreview] = useState(false);

  const [profile, setProfile] = useState({
    businessName: snapshot.storefront.displayName,
    category: snapshot.storefront.category,
    slug: snapshot.storefront.slug,
    publicArea: snapshot.storefront.publicArea,
    description: snapshot.storefront.description,
  });

  const [fulfillment, setFulfillment] = useState({
    mode: snapshot.pickupSettings.mode,
    zonesSummary: snapshot.deliveryZones
      .filter((zone) => zone.enabled)
      .map((zone) => zone.name)
      .join(", "),
    hours: snapshot.storefront.orderingHoursLabel,
  });

  const [payout, setPayout] = useState({
    bankName: snapshot.payoutAccount.bankName,
    accountNumberPreview: "0123454821",
    accountHolder: snapshot.payoutAccount.accountName,
    hygieneNote: "Optional Lagos food-hygiene permit",
  });

  const [firstMenu, setFirstMenu] = useState({
    dishName: snapshot.menu[0]?.dish.name ?? "Jollof Rice & Chicken",
    price: String(snapshot.menu[0]?.offer.price.amount ?? 3500),
    orderingModel: "hybrid",
    prepEstimate: snapshot.settings.defaultPreparationEstimate,
  });

  const ready = completed.size === steps.length;

  const markStepDone = (id: StepId) => {
    setCompleted((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
    setDraftSavedMessage(`Step "${steps.find((step) => step.id === id)?.title ?? id}" saved in this frontend preview.`);
    setActiveStep(null);
  };

  const toggleStepDone = (id: StepId) => {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="vendor-onboarding">
      <Link className="vendor-onboarding-brand" href="/vendor">
        MealHrs <span>for kitchens</span>
      </Link>
      <div className="vendor-onboarding-card">
        <p className="vendor-eyebrow">Kitchen setup</p>
        <h1>{ready ? "Your kitchen is ready" : "Set up your kitchen"}</h1>
        <p>
          Start with the details that make ordering clear for your customers. You can save draft progress and return anytime.
        </p>

        {draftSavedMessage ? (
          <Notice tone="success" style={{ marginTop: 16 }}>
            {draftSavedMessage}
          </Notice>
        ) : null}

        {submittedPreview ? (
          <Notice tone="info" style={{ marginTop: 16 }}>
            Verification preview recorded locally. Real KYB, phone, and payout checks run on the future backend.
          </Notice>
        ) : null}

        <ol className="vendor-steps">
          {steps.map((step, index) => {
            const done = completed.has(step.id);
            const expanded = activeStep === step.id;
            return (
              <li className="vendor-step-item" data-done={done ? "true" : "false"} key={step.id}>
                <button
                  className="vendor-step-trigger"
                  type="button"
                  aria-pressed={done}
                  aria-expanded={expanded}
                  onClick={() => setActiveStep((current) => (current === step.id ? null : step.id))}
                >
                  <span>{done ? <Check aria-hidden="true" /> : index + 1}</span>
                  <span>
                    <strong>{step.title}</strong>
                    <small>{step.detail}</small>
                  </span>
                  {expanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                </button>

                {expanded ? (
                  <div className="vendor-step-body">
                    {step.id === "profile" ? (
                      <div className="vendor-step-grid">
                        <label className="vendor-step-field">
                          <span>Business name</span>
                          <input
                            value={profile.businessName}
                            onChange={(event) => setProfile({ ...profile, businessName: event.target.value })}
                          />
                        </label>
                        <label className="vendor-step-field">
                          <span>Business category</span>
                          <select
                            value={profile.category}
                            onChange={(event) => setProfile({ ...profile, category: event.target.value })}
                          >
                            <option>Nigerian kitchen</option>
                            <option>Home kitchen</option>
                            <option>Restaurant</option>
                            <option>Bakery</option>
                            <option>Caterer</option>
                          </select>
                        </label>
                        <label className="vendor-step-field">
                          <span>Storefront slug (mealhrs.com/k/...)</span>
                          <input
                            value={profile.slug}
                            onChange={(event) => setProfile({ ...profile, slug: event.target.value })}
                          />
                        </label>
                        <label className="vendor-step-field">
                          <span>Base area (State → LGA → Area)</span>
                          <input
                            value={profile.publicArea}
                            onChange={(event) => setProfile({ ...profile, publicArea: event.target.value })}
                          />
                        </label>
                        <label className="vendor-step-field" style={{ gridColumn: "1 / -1" }}>
                          <span>Kitchen story</span>
                          <textarea
                            value={profile.description}
                            onChange={(event) => setProfile({ ...profile, description: event.target.value })}
                          />
                        </label>
                      </div>
                    ) : null}

                    {step.id === "fulfillment" ? (
                      <div className="vendor-step-grid">
                        <label className="vendor-step-field">
                          <span>Fulfillment mode</span>
                          <select
                            value={fulfillment.mode}
                            onChange={(event) =>
                              setFulfillment({
                                ...fulfillment,
                                mode: event.target.value as typeof fulfillment.mode,
                              })
                            }
                          >
                            <option value="both">Delivery and pickup</option>
                            <option value="delivery">Delivery only</option>
                            <option value="pickup">Pickup only</option>
                          </select>
                        </label>
                        <label className="vendor-step-field">
                          <span>Supported delivery areas</span>
                          <input
                            value={fulfillment.zonesSummary}
                            onChange={(event) => setFulfillment({ ...fulfillment, zonesSummary: event.target.value })}
                          />
                        </label>
                        <label className="vendor-step-field" style={{ gridColumn: "1 / -1" }}>
                          <span>Ordering hours</span>
                          <input
                            value={fulfillment.hours}
                            onChange={(event) => setFulfillment({ ...fulfillment, hours: event.target.value })}
                          />
                        </label>
                      </div>
                    ) : null}

                    {step.id === "payout_preview" ? (
                      <>
                        <div className="vendor-step-grid">
                          <label className="vendor-step-field">
                            <span>Bank name (preview)</span>
                            <input
                              value={payout.bankName}
                              onChange={(event) => setPayout({ ...payout, bankName: event.target.value })}
                            />
                          </label>
                          <label className="vendor-step-field">
                            <span>Account number (preview)</span>
                            <input
                              value={payout.accountNumberPreview}
                              onChange={(event) => setPayout({ ...payout, accountNumberPreview: event.target.value })}
                            />
                          </label>
                          <label className="vendor-step-field">
                            <span>Account holder</span>
                            <input
                              value={payout.accountHolder}
                              onChange={(event) => setPayout({ ...payout, accountHolder: event.target.value })}
                            />
                          </label>
                          <label className="vendor-step-field">
                            <span>Food safety certification note</span>
                            <input
                              value={payout.hygieneNote}
                              onChange={(event) => setPayout({ ...payout, hygieneNote: event.target.value })}
                            />
                          </label>
                        </div>
                        <div className="cluster">
                          <Status tone={snapshot.verification.accountVerified ? "success" : "neutral"}>
                            {snapshot.verification.accountVerified ? "Account verified" : "Account unverified"}
                          </Status>
                          <Status tone={snapshot.verification.businessReviewed ? "success" : "warning"}>
                            {snapshot.verification.businessReviewed ? "Business info reviewed" : "Business review pending"}
                          </Status>
                          <Status tone={snapshot.verification.foodSafetyCertified ? "success" : "neutral"}>
                            {snapshot.verification.foodSafetyCertified
                              ? "Food-safety certified"
                              : "Food-safety certificate optional"}
                          </Status>
                        </div>
                      </>
                    ) : null}

                    {step.id === "first_menu" ? (
                      <div className="vendor-step-grid">
                        <label className="vendor-step-field">
                          <span>First dish name</span>
                          <input
                            value={firstMenu.dishName}
                            onChange={(event) => setFirstMenu({ ...firstMenu, dishName: event.target.value })}
                          />
                        </label>
                        <label className="vendor-step-field">
                          <span>Base price (₦)</span>
                          <input
                            type="number"
                            min={100}
                            value={firstMenu.price}
                            onChange={(event) => setFirstMenu({ ...firstMenu, price: event.target.value })}
                          />
                        </label>
                        <label className="vendor-step-field">
                          <span>Ordering model</span>
                          <select
                            value={firstMenu.orderingModel}
                            onChange={(event) => setFirstMenu({ ...firstMenu, orderingModel: event.target.value })}
                          >
                            <option value="hybrid">Hybrid (Immediate &amp; Pre-order Batches)</option>
                            <option value="immediate">Immediate ordering</option>
                            <option value="meal_drop">Scheduled pre-order batches</option>
                          </select>
                        </label>
                        <label className="vendor-step-field">
                          <span>Default prep estimate</span>
                          <input
                            value={firstMenu.prepEstimate}
                            onChange={(event) => setFirstMenu({ ...firstMenu, prepEstimate: event.target.value })}
                          />
                        </label>
                      </div>
                    ) : null}

                    <div className="vendor-step-actions">
                      <Button size="sm" variant="ghost" type="button" onClick={() => toggleStepDone(step.id)}>
                        {done ? "Mark incomplete" : "Mark complete"}
                      </Button>
                      <Button size="sm" type="button" onClick={() => markStepDone(step.id)}>
                        Save step preview
                      </Button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="stack">
          {ready ? (
            <Button asChild block>
              <Link href="/vendor">
                <CircleCheck aria-hidden="true" />
                Go to overview
              </Link>
            </Button>
          ) : (
            <Button block onClick={() => setCompleted(new Set(steps.map((step) => step.id)))}>
              Complete preview setup
            </Button>
          )}
          <div className="split">
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={() => setDraftSavedMessage("Onboarding draft saved locally for this preview.")}
            >
              Save progress
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => setSubmittedPreview(true)}
            >
              Submit for verification preview
            </Button>
          </div>
        </div>

        <p className="vendor-preview-note" style={{ marginTop: 14 }}>
          This is a frontend setup preview. No kitchen profile, KYB record, or payout account is published yet.
        </p>
      </div>
    </div>
  );
}
