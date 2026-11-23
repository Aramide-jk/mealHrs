"use client";

import type {
  VendorDashboardSettings,
  VendorOperatingSchedule,
  VendorPayoutAccountPreview,
  VendorTeamMember,
  VendorTeamRole,
} from "@mealhrs/domain";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Building2,
  Check,
  ShieldCheck,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { useVendorWorkspace } from "../vendor-workspace-context";
import { Field, PageHead, Toggle } from "./vendor-insights-primitives";
import styles from "./vendor-insights.module.css";
import { useCustomerActivity } from "@/lib/customer-activity-context";

type SettingsTab = "general" | "availability" | "team" | "payout";

export function VendorSettingsView({
  settings,
  operatingSchedule,
  teamMembers = [],
  payoutAccount = {
    bankName: "Access Bank",
    accountNumberMasked: "•••• 4821",
    accountName: "Amaka Okafor Kitchen Ventures",
    settlementSchedule: "Next business day (T+1 preview)",
    verified: true,
  },
}: Readonly<{
  settings: VendorDashboardSettings;
  operatingSchedule?: VendorOperatingSchedule;
  teamMembers?: readonly VendorTeamMember[];
  payoutAccount?: VendorPayoutAccountPreview;
}>) {
  const {
    acceptsOrders,
    pauseImmediate,
    pausePreorders,
    setAcceptsOrders,
    setPauseImmediate,
    setPausePreorders,
  } = useVendorWorkspace();
  const { kitchenRushEnabled, toggleKitchenRush } = useCustomerActivity();

  const [tab, setTab] = useState<SettingsTab>("general");
  const [form, setForm] = useState<VendorDashboardSettings>({
    ...settings,
    autoAcceptOrders: settings.autoAcceptOrders ?? false,
    whatsAppNotifications: settings.whatsAppNotifications ?? true,
    smsNotifications: settings.smsNotifications ?? true,
    emailDigest: settings.emailDigest ?? true,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [team, setTeam] = useState<readonly VendorTeamMember[]>(teamMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [teamFeedback, setTeamFeedback] = useState("");

  const [maxOrders, setMaxOrders] = useState(
    operatingSchedule?.maxSimultaneousOrders ?? 12,
  );
  const [specialClosure, setSpecialClosure] = useState(
    operatingSchedule?.specialClosureNote ?? "",
  );
  const [closureEnabled, setClosureEnabled] = useState(
    Boolean(operatingSchedule?.specialClosureNote),
  );
  const [availabilitySaved, setAvailabilitySaved] = useState(false);

  // Payout bank state
  const [bankInfo, setBankInfo] = useState<VendorPayoutAccountPreview>(payoutAccount);
  const [editBankOpen, setEditBankOpen] = useState(false);
  const [bankFeedback, setBankFeedback] = useState("");

  const saveGeneral = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail.trim())) {
      setError("Enter a valid support email address.");
      return;
    }
    setError("");
    setSaved(true);
  };

  const saveAvailabilitySettings = () => {
    setAvailabilitySaved(true);
  };

  const inviteMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const role = String(data.get("role") ?? "kitchen_staff") as VendorTeamRole;
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Provide a staff name and valid email address.");
      return;
    }
    setTeam((current) => [
      ...current,
      { id: `tm-${Date.now()}`, name, email, role, status: "invited" },
    ]);
    setInviteError("");
    setInviteOpen(false);
    setTeamFeedback(
      `Preview invite created for ${name} (${role.replace("_", " ")}). No email was sent in preview mode.`,
    );
  };

  const handleSaveBank = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const bankName = String(data.get("bankName") ?? "").trim();
    const accountNumber = String(data.get("accountNumber") ?? "").trim();
    const accountName = String(data.get("accountName") ?? "").trim();

    if (bankName.length < 2 || accountNumber.length < 10 || accountName.length < 3) {
      return;
    }

    setBankInfo({
      bankName,
      accountNumberMasked: `•••• ${accountNumber.slice(-4)}`,
      accountName,
      settlementSchedule: "Next business day (T+1 preview)",
      verified: true,
    });
    setEditBankOpen(false);
    setBankFeedback("Settlement bank details updated for this preview.");
  };

  return (
    <PageHead
      eyebrow="Workspace configuration"
      title="Settings"
      description="Manage notification channels, order acceptance rules, granular kitchen availability, staff access, and settlement accounts."
    >
      {/* 4 Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Settings sections">
        <button
          key="general"
          type="button"
          role="tab"
          id="tab-general"
          aria-selected={tab === "general"}
          aria-controls="panel-general"
          onClick={() => setTab("general")}
        >
          Notifications &amp; defaults
        </button>
        <button
          key="availability"
          type="button"
          role="tab"
          id="tab-availability"
          aria-selected={tab === "availability"}
          aria-controls="panel-availability"
          onClick={() => setTab("availability")}
        >
          Availability &amp; limits
        </button>
        <button
          key="team"
          type="button"
          role="tab"
          id="tab-team"
          aria-selected={tab === "team"}
          aria-controls="panel-team"
          onClick={() => setTab("team")}
        >
          Team &amp; permissions ({team.length})
        </button>
        <button
          key="payout"
          type="button"
          role="tab"
          id="tab-payout"
          aria-selected={tab === "payout"}
          aria-controls="panel-payout"
          onClick={() => setTab("payout")}
        >
          Payout &amp; settlement bank
        </button>
      </div>

      {/* Tab 1: Notifications & Defaults */}
      {tab === "general" ? (
        <section
          className={`card ${styles.section}`}
          role="tabpanel"
          id="panel-general"
          aria-labelledby="tab-general"
        >
          <h2>Order acceptance &amp; defaults</h2>
          <p className="vendor-muted">
            Configure how incoming customer orders are handled and how your team is notified.
          </p>

          <div className={styles.setting}>
            <div>
              <h3>Immediate order acceptance mode</h3>
              <p>
                {form.autoAcceptOrders
                  ? "Orders are automatically accepted and sent to kitchen prep immediately."
                  : "Kitchen staff must manually accept new immediate orders within 10 minutes."}
              </p>
            </div>
            <Toggle
              value={form.autoAcceptOrders ?? false}
              label="Auto-accept immediate orders"
              onChange={(value) => {
                setSaved(false);
                setForm({ ...form, autoAcceptOrders: value });
              }}
            />
          </div>

          <h3 style={{ fontSize: "0.85rem", margin: "20px 0 6px" }}>
            Notification channels
          </h3>

          <div className={styles.setting}>
            <div>
              <h3>Push &amp; in-app order alerts</h3>
              <p>Show prominent operational prompts when new immediate orders arrive.</p>
            </div>
            <Toggle
              value={form.orderNotifications}
              label="New order notifications"
              onChange={(value) => {
                setSaved(false);
                setForm({ ...form, orderNotifications: value });
              }}
            />
          </div>

          <div className={styles.setting}>
            <div>
              <h3>WhatsApp order notifications</h3>
              <p>Receive order dispatch alerts and cutoff reminders directly on WhatsApp.</p>
            </div>
            <Toggle
              value={form.whatsAppNotifications ?? true}
              label="WhatsApp order notifications"
              onChange={(value) => {
                setSaved(false);
                setForm({ ...form, whatsAppNotifications: value });
              }}
            />
          </div>

          <div className={styles.setting}>
            <div>
              <h3>SMS alerts for urgent dispatches</h3>
              <p>Critical text message backup if order remains unacknowledged for 5 minutes.</p>
            </div>
            <Toggle
              value={form.smsNotifications ?? true}
              label="SMS alerts"
              onChange={(value) => {
                setSaved(false);
                setForm({ ...form, smsNotifications: value });
              }}
            />
          </div>

          <div className={styles.setting}>
            <div>
              <h3>Pre-order cutoff reminders</h3>
              <p>Advance reminder 2 hours before a Meal Drop batch cutoff time.</p>
            </div>
            <Toggle
              value={form.mealDropReminders}
              label="Pre-order reminders"
              onChange={(value) => {
                setSaved(false);
                setForm({ ...form, mealDropReminders: value });
              }}
            />
          </div>

          <div className={styles.form} style={{ marginTop: 18 }}>
            {error ? (
              <p className={styles.errorBanner} role="alert">
                {error}
              </p>
            ) : null}

            <div className={styles.formGrid}>
              <Field label="Default kitchen prep estimate">
                <select
                  value={form.defaultPreparationEstimate}
                  onChange={(event) => {
                    setSaved(false);
                    setForm({ ...form, defaultPreparationEstimate: event.target.value });
                  }}
                >
                  <option>20–30 min</option>
                  <option>25–35 min</option>
                  <option>35–50 min</option>
                  <option>45–60 min</option>
                </select>
              </Field>
              <Field label="Public kitchen support email">
                <input
                  type="email"
                  value={form.supportEmail}
                  onChange={(event) => {
                    setSaved(false);
                    setError("");
                    setForm({ ...form, supportEmail: event.target.value });
                  }}
                />
              </Field>
            </div>

            <div className={styles.formFoot}>
              <Button type="button" onClick={saveGeneral}>
                Save settings preview
              </Button>
              {saved ? (
                <p className={`${styles.formHint} ${styles.saved}`} role="status">
                  <Check aria-hidden="true" size={14} />
                  Preferences saved locally
                </p>
              ) : null}
            </div>
          </div>

          <div
            className="cluster"
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: "1px solid var(--color-line)",
            }}
          >
            <Button asChild size="sm" variant="secondary">
              <Link href="/vendor/verification">
                <ShieldCheck aria-hidden="true" size={14} />
                Verification &amp; payout compliance
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/vendor/support">Kitchen support</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/vendor/onboarding">Revisit setup checklist</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {/* Tab 2: Availability & Limits */}
      {tab === "availability" ? (
        <section
          className={`card ${styles.section}`}
          role="tabpanel"
          id="panel-availability"
          aria-labelledby="tab-availability"
        >
          <h2>Granular service pauses</h2>
          <p className="vendor-muted">
            Pausing new orders stops checkout immediately without affecting previously confirmed commitments.
          </p>

          <div className={styles.setting}>
            <div>
              <h3>Accept orders on storefront</h3>
              <p>Master switch across all immediate dishes and pre-order drops.</p>
            </div>
            <Toggle
              value={acceptsOrders}
              label="Accept orders on storefront"
              onChange={(value) => setAcceptsOrders(value)}
            />
          </div>

          <div className={styles.setting}>
            <div>
              <h3>Pause immediate orders only</h3>
              <p>Keep pre-order bookings open while temporarily halting today&apos;s kitchen line.</p>
            </div>
            <Toggle
              value={pauseImmediate}
              label="Pause immediate orders only"
              onChange={(value) => setPauseImmediate(value)}
            />
          </div>

          <div className={styles.setting}>
            <div>
              <h3>Pause new pre-orders only</h3>
              <p>Stop accepting new pre-orders without interrupting today&apos;s active immediate menu.</p>
            </div>
            <Toggle
              value={pausePreorders}
              label="Pause new pre-orders only"
              onChange={(value) => setPausePreorders(value)}
            />
          </div>

          <div className={styles.setting}>
            <div>
              <h3>Kitchen Rush Mode (+15 mins)</h3>
              <p>Temporarily buffer preparation time estimates when the kitchen is handling peak rush volume.</p>
            </div>
            <Toggle
              value={kitchenRushEnabled}
              label="Kitchen Rush Mode"
              onChange={(value) => toggleKitchenRush(value)}
            />
          </div>

          <div className={styles.form} style={{ marginTop: 18 }}>
            <Field label="Maximum simultaneous immediate orders">
              <input
                type="number"
                min={1}
                value={maxOrders}
                onChange={(event) =>
                  setMaxOrders(Math.max(1, Number(event.target.value) || 1))
                }
              />
            </Field>

            {/* Emergency Closure Notice */}
            <div
              style={{
                padding: "14px",
                border: "1px solid var(--color-line)",
                borderRadius: 10,
                background: "var(--color-surface-soft)",
              }}
            >
              <div className="split" style={{ alignItems: "center", marginBottom: 8 }}>
                <div>
                  <strong style={{ fontSize: "0.76rem" }}>Emergency / temporary closure notice</strong>
                  <p className="vendor-muted" style={{ margin: 0, fontSize: "0.64rem" }}>
                    Displays a prominent notice at the top of your public storefront.
                  </p>
                </div>
                <Toggle
                  value={closureEnabled}
                  label="Enable temporary closure notice"
                  onChange={(val) => setClosureEnabled(val)}
                />
              </div>
              {closureEnabled ? (
                <input
                  value={specialClosure}
                  onChange={(e) => setSpecialClosure(e.target.value)}
                  placeholder="e.g. Kitchen closed until Thursday for catering event."
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    fontSize: "0.74rem",
                    border: "1px solid var(--color-line)",
                    borderRadius: 8,
                    background: "var(--color-surface)",
                  }}
                />
              ) : null}
            </div>

            <div className={styles.formFoot}>
              <Button type="button" onClick={saveAvailabilitySettings}>
                Save availability rules
              </Button>
              {availabilitySaved ? (
                <p className={`${styles.formHint} ${styles.saved}`} role="status">
                  <Check aria-hidden="true" size={14} />
                  Availability preferences saved locally
                </p>
              ) : null}
            </div>

            <Notice tone="info">
              Configure regular weekly opening hours under{" "}
              <Link href="/vendor/menu">
                <u>Menu → Ordering hours</u>
              </Link>
              .
            </Notice>
          </div>
        </section>
      ) : null}

      {/* Tab 3: Team & Permissions */}
      {tab === "team" ? (
        <section
          className={`card ${styles.section}`}
          role="tabpanel"
          id="panel-team"
          aria-labelledby="tab-team"
        >
          <div className="split" style={{ marginBottom: 14 }}>
            <div>
              <h2>Staff roles &amp; permissions</h2>
              <p className="vendor-muted" style={{ margin: 0 }}>
                Staff access is strictly scoped to this kitchen. Unrelated vendor accounts are never visible.
              </p>
            </div>
            <Button
              size="sm"
              type="button"
              onClick={() => {
                setInviteError("");
                setInviteOpen(true);
              }}
            >
              <UserPlus aria-hidden="true" size={14} />
              Invite staff
            </Button>
          </div>

          {teamFeedback ? (
            <p className={styles.feedback} role="status">
              {teamFeedback}
            </p>
          ) : null}

          {/* Permissions Breakdown Guide */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                border: "1px solid var(--color-line)",
                borderRadius: 9,
                fontSize: "0.68rem",
              }}
            >
              <strong>Manager</strong>
              <p className="vendor-muted" style={{ margin: "2px 0 0" }}>
                Full operational control: orders, menu, content, customer records, and settings.
              </p>
            </div>
            <div
              style={{
                padding: "10px 12px",
                border: "1px solid var(--color-line)",
                borderRadius: 9,
                fontSize: "0.68rem",
              }}
            >
              <strong>Kitchen staff</strong>
              <p className="vendor-muted" style={{ margin: "2px 0 0" }}>
                Order prep list, item status updates, and dispatch handoffs only.
              </p>
            </div>
            <div
              style={{
                padding: "10px 12px",
                border: "1px solid var(--color-line)",
                borderRadius: 9,
                fontSize: "0.68rem",
              }}
            >
              <strong>Content manager</strong>
              <p className="vendor-muted" style={{ margin: "2px 0 0" }}>
                Food reels, photos, captions, and customer comment moderation only.
              </p>
            </div>
          </div>

          <div>
            {team.map((member) => (
              <div className={styles.teamRow} key={member.id}>
                <div>
                  <div className="cluster" style={{ alignItems: "center", gap: 8 }}>
                    <strong>{member.name}</strong>
                    <Status tone={member.status === "active" ? "success" : "neutral"}>
                      {member.status === "active" ? "Active" : "Invite pending"}
                    </Status>
                  </div>
                  <span>{member.email}</span>
                </div>
                <div className={styles.teamControls}>
                  <select
                    aria-label={`Role for ${member.name}`}
                    value={member.role}
                    disabled={member.role === "owner"}
                    onChange={(event) => {
                      const nextRole = event.target.value as VendorTeamRole;
                      setTeam((current) =>
                        current.map((candidate) =>
                          candidate.id === member.id
                            ? { ...candidate, role: nextRole }
                            : candidate,
                        ),
                      );
                      setTeamFeedback(
                        `Updated ${member.name} role to ${nextRole.replace("_", " ")} in preview.`,
                      );
                    }}
                  >
                    <option value="owner">Owner (Full access &amp; bank)</option>
                    <option value="manager">Manager (Ops &amp; menus)</option>
                    <option value="kitchen_staff">Kitchen staff (Prep only)</option>
                    <option value="content_manager">Content manager (Social)</option>
                  </select>
                  {member.role !== "owner" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setTeam((current) =>
                          current.filter((candidate) => candidate.id !== member.id),
                        );
                        setTeamFeedback(`Removed ${member.name} in this frontend preview.`);
                      }}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Invite Staff Dialog */}
          <Dialog.Root open={inviteOpen} onOpenChange={setInviteOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.dialogBackdrop} />
              <Dialog.Content className={styles.dialog} aria-modal="true">
                <div className={styles.dialogHead}>
                  <div>
                    <p className={styles.eyebrow}>Staff invitation</p>
                    <Dialog.Title>Invite team member</Dialog.Title>
                    <Dialog.Description>
                      Assign least-privilege permissions for kitchen operations or content.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className={styles.dialogClose}
                      type="button"
                      aria-label="Close staff invite"
                    >
                      <X aria-hidden="true" size={16} />
                    </button>
                  </Dialog.Close>
                </div>
                <form className={styles.dialogBody} onSubmit={inviteMember} noValidate>
                  {inviteError ? (
                    <p className={styles.errorBanner} role="alert">
                      {inviteError}
                    </p>
                  ) : null}
                  <Field label="Staff name">
                    <input name="name" placeholder="e.g. Chidi Eze" required />
                  </Field>
                  <Field label="Email address">
                    <input
                      name="email"
                      type="email"
                      placeholder="staff@example.com"
                      required
                    />
                  </Field>
                  <Field label="Role permissions">
                    <select name="role" defaultValue="kitchen_staff">
                      <option value="manager">Manager (menus, orders, content, reporting)</option>
                      <option value="kitchen_staff">
                        Kitchen staff (assigned orders &amp; prep status)
                      </option>
                      <option value="content_manager">
                        Content manager (posts &amp; engagement)
                      </option>
                    </select>
                  </Field>
                  <Button type="submit" block>
                    Send preview invite
                  </Button>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </section>
      ) : null}

      {/* Tab 4: Payout Bank & Settlement */}
      {tab === "payout" ? (
        <section
          className={`card ${styles.section}`}
          role="tabpanel"
          id="panel-payout"
          aria-labelledby="tab-payout"
        >
          <div className="split" style={{ alignItems: "center", marginBottom: 14 }}>
            <div>
              <h2>Settlement bank account</h2>
              <p className="vendor-muted" style={{ margin: 0 }}>
                Earnings from delivered orders are automatically disbursed to this Nigerian bank account.
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={() => setEditBankOpen(true)}
            >
              <Building2 aria-hidden="true" size={14} />
              Edit payout bank
            </Button>
          </div>

          {bankFeedback ? (
            <p className={styles.feedback} role="status">
              {bankFeedback}
            </p>
          ) : null}

          <div
            style={{
              padding: "16px",
              border: "1px solid var(--color-line)",
              borderRadius: 12,
              background: "var(--color-surface-soft)",
              marginBottom: 16,
            }}
          >
            <div className="split" style={{ alignItems: "center", marginBottom: 10 }}>
              <div>
                <strong style={{ fontSize: "0.85rem", display: "block" }}>
                  {bankInfo.bankName}
                </strong>
                <span className="vendor-muted" style={{ fontSize: "0.72rem" }}>
                  Account number: {bankInfo.accountNumberMasked}
                </span>
              </div>
              <Status tone={bankInfo.verified ? "success" : "warning"}>
                {bankInfo.verified ? "Verified for payouts" : "Verification required"}
              </Status>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.fact}>
                <span>Account holder name</span>
                <strong>{bankInfo.accountName}</strong>
              </div>
              <div className={styles.fact}>
                <span>Settlement schedule</span>
                <strong>{bankInfo.settlementSchedule}</strong>
              </div>
            </div>
          </div>

          <div className="cluster" style={{ gap: 10 }}>
            <Button asChild size="sm" variant="secondary">
              <Link href="/vendor/verification">
                <ArrowUpRight aria-hidden="true" size={14} />
                View business verification documents
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/vendor/earnings">
                <Wallet aria-hidden="true" size={14} />
                View recent settlements
              </Link>
            </Button>
          </div>

          {/* Edit Bank Account Dialog */}
          <Dialog.Root open={editBankOpen} onOpenChange={setEditBankOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.dialogBackdrop} />
              <Dialog.Content className={styles.dialog} aria-modal="true">
                <div className={styles.dialogHead}>
                  <div>
                    <p className={styles.eyebrow}>Bank settlement</p>
                    <Dialog.Title>Update payout account</Dialog.Title>
                    <Dialog.Description>
                      Settlement bank must match the registered business name or kitchen owner.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className={styles.dialogClose}
                      type="button"
                      aria-label="Close edit bank"
                    >
                      <X aria-hidden="true" size={16} />
                    </button>
                  </Dialog.Close>
                </div>
                <form className={styles.dialogBody} onSubmit={handleSaveBank} noValidate>
                  <Field label="Bank name">
                    <select name="bankName" defaultValue={bankInfo.bankName}>
                      <option value="Access Bank">Access Bank</option>
                      <option value="Guaranty Trust Bank (GTBank)">
                        Guaranty Trust Bank (GTBank)
                      </option>
                      <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                      <option value="United Bank for Africa (UBA)">
                        United Bank for Africa (UBA)
                      </option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="Kuda Bank">Kuda Bank</option>
                      <option value="Moniepoint MFB">Moniepoint MFB</option>
                      <option value="OPay">OPay</option>
                    </select>
                  </Field>
                  <Field label="10-digit NUBAN account number">
                    <input
                      name="accountNumber"
                      type="tel"
                      maxLength={10}
                      defaultValue="0123456789"
                      required
                    />
                  </Field>
                  <Field label="Account holder name">
                    <input
                      name="accountName"
                      defaultValue={bankInfo.accountName}
                      required
                    />
                  </Field>
                  <Button type="submit" block>
                    Save payout bank preview
                  </Button>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </section>
      ) : null}
    </PageHead>
  );
}
