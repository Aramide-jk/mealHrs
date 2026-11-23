"use client";

import type { VendorStorefrontSettings } from "@mealhrs/domain";
import {
  Bell,
  Check,
  Copy,
  ExternalLink,
  Instagram,
  MessageCircle,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { useStorefrontPreview } from "@/lib/storefront-preview-context";
import { useVendorWorkspace } from "../vendor-workspace-context";
import { Field, PageHead, Toggle } from "./vendor-insights-primitives";
import styles from "./vendor-insights.module.css";

const COVER_OPTIONS = [
  { label: "Party Jollof Feast", url: "/assets/hero-jollof.png" },
  { label: "Egusi & Swallow", url: "/assets/egusi-pounded-yam.png" },
  { label: "Artisan Bakery Drop", url: "/assets/bakery-drop.png" },
] as const;

const SPECIALTY_PRESETS = [
  "100% Homemade",
  "Halal",
  "Party Catering",
  "No MSG",
  "Vegetarian Options",
  "Family Trays",
  "Small Batch",
] as const;

export function VendorStorefrontView({
  storefront,
}: Readonly<{ storefront: VendorStorefrontSettings }>) {
  const { updateStorefrontMeta } = useVendorWorkspace();
  const storefrontPreview = useStorefrontPreview();
  const initialData = storefrontPreview.storefront ?? storefront;
  const [form, setForm] = useState<VendorStorefrontSettings>({
    ...initialData,
    coverUrl: initialData.coverUrl || "/assets/hero-jollof.png",
    avatarUrl: initialData.avatarUrl || "/assets/approved-reels-reference.png",
    announcementNotice:
      initialData.announcementNotice ??
      "Weekend party jollof pre-orders close every Friday at 6:00 PM.",
    announcementEnabled: initialData.announcementEnabled ?? true,
    specialtyTags: initialData.specialtyTags ?? [
      "100% Homemade",
      "Halal",
      "Party Catering",
    ],
    whatsAppPhone: initialData.whatsAppPhone ?? initialData.contactPhone,
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const updateField = <K extends keyof VendorStorefrontSettings>(
    key: K,
    value: VendorStorefrontSettings[K],
  ) => {
    setSaved(false);
    setError("");
    setForm((current) => {
      const next = { ...current, [key]: value };
      storefrontPreview.updateStorefront({ [key]: value });
      return next;
    });
  };

  const toggleSpecialty = (tag: string) => {
    setSaved(false);
    setForm((current) => {
      const existing = current.specialtyTags ?? [];
      const updated = existing.includes(tag)
        ? existing.filter((t) => t !== tag)
        : [...existing, tag];
      const next = { ...current, specialtyTags: updated };
      storefrontPreview.updateStorefront({ specialtyTags: updated });
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.displayName.trim().length < 2 || form.slug.trim().length < 2) {
      setError("Kitchen name and storefront URL slug are required.");
      return;
    }
    storefrontPreview.updateStorefront(form);
    updateStorefrontMeta({
      displayName: form.displayName.trim(),
      slug: form.slug.trim(),
      publicArea: form.publicArea.trim(),
      acceptsOrders: form.acceptsOrders,
    });
    setSaved(true);
  };

  const copyStoreUrl = async () => {
    const url = `${typeof window === "undefined" ? "" : window.location.origin}/k/${form.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  return (
    <PageHead
      eyebrow="Customer-facing profile"
      title="Storefront & branding"
      description="Design your public kitchen identity, banner photography, cuisine specialties, announcements, and direct WhatsApp contact."
      action={
        <div className="cluster">
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => void copyStoreUrl()}
          >
            <Copy aria-hidden="true" size={14} />
            {copied ? "Copied URL" : "Copy link"}
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href={`/k/${form.slug}`} target="_blank">
              <ExternalLink aria-hidden="true" size={14} />
              View live
            </Link>
          </Button>
        </div>
      }
    >
      <div className={styles.storeLayout}>
        {/* Left column: Configuration form */}
        <section className={`card ${styles.section}`}>
          {error ? (
            <p className={styles.errorBanner} role="alert">
              {error}
            </p>
          ) : null}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.setting} style={{ paddingTop: 0 }}>
              <div>
                <h3>Storefront accepting orders</h3>
                <p>
                  Paused kitchens remain discoverable to customers without accepting new orders.
                </p>
              </div>
              <Toggle
                value={form.acceptsOrders}
                label="Storefront accepting orders"
                onChange={(value) => updateField("acceptsOrders", value)}
              />
            </div>

            {/* Banner Cover Selection */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: 600, display: "block", marginBottom: 4 }}>
                Cover banner photography
              </label>
              <span className="vendor-muted" style={{ fontSize: "0.64rem", display: "block", marginBottom: 6 }}>
                Choose a verified high-resolution food spread representing your culinary style.
              </span>
              <div className={styles.coverGrid}>
                {COVER_OPTIONS.map((cover) => (
                  <button
                    key={cover.url}
                    type="button"
                    className={`${styles.coverOption} ${
                      form.coverUrl === cover.url ? styles.coverOptionActive : ""
                    }`}
                    onClick={() => updateField("coverUrl", cover.url)}
                    aria-label={`Select ${cover.label}`}
                  >
                    <Image
                      src={cover.url}
                      alt={cover.label}
                      width={120}
                      height={64}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGrid}>
              <Field label="Kitchen name">
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={(event) => updateField("displayName", event.target.value)}
                  required
                />
              </Field>
              <Field label="Storefront slug (mealhrs.com/k/...)">
                <input
                  name="slug"
                  value={form.slug}
                  onChange={(event) =>
                    updateField(
                      "slug",
                      event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  required
                />
              </Field>
            </div>

            <div className={styles.formGrid}>
              <Field label="Handle">
                <input
                  value={form.handle}
                  onChange={(event) => updateField("handle", event.target.value)}
                />
              </Field>
              <Field label="Business category">
                <select
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                >
                  <option>Nigerian kitchen</option>
                  <option>Home kitchen</option>
                  <option>Restaurant</option>
                  <option>Soups &amp; swallow</option>
                  <option>Bakery</option>
                  <option>Caterer</option>
                </select>
              </Field>
            </div>

            <div className={styles.formGrid}>
              <Field label="Public area (private street stays hidden)">
                <input
                  value={form.publicArea}
                  onChange={(event) => updateField("publicArea", event.target.value)}
                />
              </Field>
              <Field label="Ordering hours display">
                <input
                  value={form.orderingHoursLabel}
                  onChange={(event) => updateField("orderingHoursLabel", event.target.value)}
                />
              </Field>
            </div>

            {/* Announcement Banner */}
            <div>
              <div className="split" style={{ alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                  Kitchen announcement banner
                </label>
                <label className="cluster" style={{ fontSize: "0.65rem", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={form.announcementEnabled ?? true}
                    onChange={(e) => updateField("announcementEnabled", e.target.checked)}
                  />
                  <span>Show banner</span>
                </label>
              </div>
              <input
                value={form.announcementNotice ?? ""}
                onChange={(event) => updateField("announcementNotice", event.target.value)}
                placeholder="e.g. Taking weekend pre-orders until Friday 6:00 PM!"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: "0.74rem",
                  border: "1px solid var(--color-line)",
                  borderRadius: 8,
                }}
              />
            </div>

            {/* Dietary & Specialty Badges */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: 600, display: "block", marginBottom: 4 }}>
                Specialty &amp; dietary badges
              </label>
              <div className={styles.pillGroup}>
                {SPECIALTY_PRESETS.map((tag) => {
                  const active = form.specialtyTags?.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`${styles.pillOption} ${active ? styles.pillOptionActive : ""}`}
                      onClick={() => toggleSpecialty(tag)}
                    >
                      {tag} {active ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.formGrid}>
              <Field label="Public order contact phone">
                <input
                  value={form.contactPhone}
                  onChange={(event) => updateField("contactPhone", event.target.value)}
                  placeholder="+234 803 000 0000"
                />
              </Field>
              <Field label="WhatsApp inquiry phone">
                <input
                  value={form.whatsAppPhone ?? ""}
                  onChange={(event) => updateField("whatsAppPhone", event.target.value)}
                  placeholder="+234 803 000 0000"
                />
              </Field>
            </div>

            <div className={styles.formGrid}>
              <Field label="Instagram handle">
                <input
                  value={form.instagramHandle}
                  onChange={(event) => updateField("instagramHandle", event.target.value)}
                />
              </Field>
              <Field label="Brand accent tone (accessible)">
                <select
                  value={form.accentPreset}
                  onChange={(event) =>
                    updateField(
                      "accentPreset",
                      event.target.value as VendorStorefrontSettings["accentPreset"],
                    )
                  }
                >
                  <option value="herb">Herb Green (Default)</option>
                  <option value="warm">Warm Tangerine</option>
                  <option value="charcoal">Deep Charcoal</option>
                </select>
              </Field>
            </div>

            <Field label="Kitchen story">
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={4}
              />
            </Field>

            <div className={styles.formFoot}>
              <Button type="submit">
                <Store aria-hidden="true" size={16} />
                Save storefront preview
              </Button>
              {saved ? (
                <p className={`${styles.formHint} ${styles.saved}`} role="status">
                  <Check aria-hidden="true" size={14} />
                  Saved locally for this preview
                </p>
              ) : (
                <p className={styles.formHint}>
                  No customer-facing change is published in this frontend preview.
                </p>
              )}
            </div>
          </form>
        </section>

        {/* Right column: Real-time Live Storefront Card Preview */}
        <aside>
          <div style={{ position: "sticky", top: 20 }}>
            <div className="split" style={{ alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-muted)" }}>
                Live customer preview
              </span>
              <Status tone={form.acceptsOrders ? "success" : "neutral"}>
                {form.acceptsOrders ? "Open for orders" : "Paused"}
              </Status>
            </div>

            <div className={styles.storePreviewCard}>
              <div className={styles.storeBanner}>
                {form.coverUrl ? (
                  <Image
                    src={form.coverUrl}
                    alt={form.displayName}
                    width={400}
                    height={140}
                  />
                ) : null}
              </div>

              <div className={styles.storeBody}>
                <div className={styles.storeAvatar}>
                  <Image
                    src={form.avatarUrl || "/assets/approved-reels-reference.png"}
                    alt={form.displayName}
                    width={56}
                    height={56}
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <h3 style={{ margin: "0 0 2px", fontSize: "1.05rem" }}>
                    {form.displayName || "Kitchen Name"}
                  </h3>
                  <p className="vendor-muted" style={{ margin: 0, fontSize: "0.68rem" }}>
                    {form.handle} · {form.category} · {form.publicArea}
                  </p>
                </div>

                {/* Announcement pill if active */}
                {form.announcementEnabled && form.announcementNotice ? (
                  <div
                    style={{
                      padding: "8px 10px",
                      background: "var(--color-orange-050)",
                      border: "1px solid var(--color-orange-100)",
                      borderRadius: 8,
                      color: "var(--color-orange-700)",
                      fontSize: "0.67rem",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Bell aria-hidden="true" size={12} style={{ flexShrink: 0 }} />
                    <span>{form.announcementNotice}</span>
                  </div>
                ) : null}

                {/* Specialty Tags */}
                {form.specialtyTags && form.specialtyTags.length > 0 ? (
                  <div className="cluster" style={{ gap: 4, marginBottom: 10 }}>
                    {form.specialtyTags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "0.62rem",
                          background: "var(--color-green-050)",
                          color: "var(--color-green-700)",
                          padding: "2px 7px",
                          borderRadius: 999,
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <p
                  style={{
                    fontSize: "0.72rem",
                    lineHeight: 1.45,
                    margin: "0 0 12px",
                    color: "var(--color-muted-strong)",
                    maxHeight: 72,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {form.description || "Fresh food prepared in small batches."}
                </p>

                <div
                  className="cluster"
                  style={{
                    gap: 6,
                    paddingTop: 10,
                    borderTop: "1px solid var(--color-line)",
                    fontSize: "0.68rem",
                  }}
                >
                  {form.whatsAppPhone ? (
                    <span className="cluster" style={{ gap: 4, color: "var(--color-green-700)", fontWeight: 500 }}>
                      <MessageCircle aria-hidden="true" size={13} />
                      WhatsApp ready
                    </span>
                  ) : null}
                  {form.instagramHandle ? (
                    <span className="cluster" style={{ gap: 4, color: "var(--color-muted)" }}>
                      <Instagram aria-hidden="true" size={13} />
                      {form.instagramHandle}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <Notice tone="info" style={{ marginTop: 14 }}>
              Customers see this banner and information at{" "}
              <strong>mealhrs.com/k/{form.slug}</strong>.
            </Notice>
          </div>
        </aside>
      </div>
    </PageHead>
  );
}
