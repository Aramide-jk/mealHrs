"use client";

import type { AdminDashboardSnapshot } from "@mealhrs/domain";
import { Check, ChevronRight, KeyRound, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { useAdminActivity, type AdminRoleType } from "@/lib/admin-activity-context";

const checkpoints = [
  {
    title: "Access context",
    detail: "Platform operations workspace authenticated with simulated 2FA security tokens.",
  },
  {
    title: "Operational responsibilities",
    detail: "Use queues deliberately; all verification decisions, rider reassignments, and refunds log to the audit trace.",
  },
  {
    title: "Multi-role capabilities",
    detail: "Switch between Super Admin, Operations, Support, and Finance personas to verify role-based permissions.",
  },
] as const;

const rolesList: readonly {
  role: AdminRoleType;
  label: string;
  desc: string;
}[] = [
  {
    role: "super_admin",
    label: "Super Admin",
    desc: "Complete authority: vendor compliance approvals, finance disbursements, system kill-switches.",
  },
  {
    role: "operations",
    label: "Operations Lead",
    desc: "Logistics intervention, dispatch rider reassignments, kitchen prep buffers, and delivery coverage.",
  },
  {
    role: "support",
    label: "Support Specialist",
    desc: "Customer dispute resolutions, goodwill vouchers, and account security flags.",
  },
  {
    role: "finance",
    label: "Finance Officer",
    desc: "Vendor payout batch processing, platform commission adjustments, and bank ledger reconciliation.",
  },
];

export function AdminAccessView({ snapshot }: Readonly<{ snapshot: AdminDashboardSnapshot }>) {
  const { activeRole, setActiveRole, checkpointsAcknowledged, setCheckpointsAcknowledged } = useAdminActivity();
  const [acknowledged, setAcknowledged] = useState<Set<number>>(
    new Set(checkpointsAcknowledged ? [0, 1, 2] : []),
  );

  const ready = acknowledged.size === checkpoints.length;

  const handleToggle = (index: number) => {
    setAcknowledged((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      if (next.size === checkpoints.length) {
        setCheckpointsAcknowledged(true);
      }
      return next;
    });
  };

  return (
    <div className="admin-access">
      <Link href="/admin" className="admin-access-brand">
        MealHrs <span>control room</span>
      </Link>

      <section className="admin-access-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <p className="admin-eyebrow">Admin access checkpoint</p>
          <Status tone="success">
            <UserCheck size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
            2FA Verified
          </Status>
        </div>

        <h1>Welcome, {snapshot.access.name.split(" ")[0]}</h1>
        <p>Manage platform permissions, inspect security checkpoints, and select your active operational persona.</p>

        {/* Role Persona Switcher */}
        <div style={{ margin: "20px 0 24px" }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-ink)", display: "block", marginBottom: 8 }}>
            Select Operational Persona:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
            {rolesList.map((r) => {
              const selected = activeRole === r.role;
              return (
                <button
                  type="button"
                  key={r.role}
                  onClick={() => setActiveRole(r.role)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 3,
                    padding: "10px 12px",
                    border: `1.5px solid ${selected ? "var(--color-green-700)" : "var(--color-line)"}`,
                    borderRadius: 10,
                    background: selected ? "var(--color-green-050)" : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  aria-pressed={selected}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <strong style={{ fontSize: "0.76rem", color: selected ? "var(--color-green-700)" : "var(--color-ink)" }}>
                      {r.label}
                    </strong>
                    {selected ? <Check size={14} color="var(--color-green-700)" /> : null}
                  </div>
                  <span style={{ fontSize: "0.64rem", color: "var(--color-muted)", lineHeight: 1.35 }}>{r.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Checkpoints */}
        <ol className="admin-checkpoints" style={{ margin: "16px 0 24px" }}>
          {checkpoints.map((checkpoint, index) => {
            const done = acknowledged.has(index);
            return (
              <li key={checkpoint.title}>
                <button
                  type="button"
                  aria-pressed={done}
                  onClick={() => handleToggle(index)}
                  style={{ cursor: "pointer" }}
                >
                  <span>{done ? <Check aria-hidden="true" /> : index + 1}</span>
                  <span>
                    <strong>{checkpoint.title}</strong>
                    <small>{checkpoint.detail}</small>
                  </span>
                  <ChevronRight aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>

        {/* Session Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "#f8f9f7",
            borderRadius: 10,
            marginBottom: 20,
            fontSize: "0.68rem",
            color: "var(--color-muted)",
          }}
        >
          <span>
            <KeyRound size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
            Session origin: Lagos (NG) · IP: 102.89.xx.xx
          </span>
          <span>Role active: <strong>{activeRole}</strong></span>
        </div>

        {ready ? (
          <Button asChild block>
            <Link href="/admin">
              <ShieldCheck aria-hidden="true" />
              Enter control room as {activeRole.replace("_", " ").toUpperCase()}
            </Link>
          </Button>
        ) : (
          <Button
            block
            onClick={() => {
              setAcknowledged(new Set([0, 1, 2]));
              setCheckpointsAcknowledged(true);
            }}
          >
            Acknowledge all checkpoints
          </Button>
        )}
      </section>
    </div>
  );
}
