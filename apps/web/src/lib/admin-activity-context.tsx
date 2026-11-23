"use client";

import { deriveCoverageHubs } from "@mealhrs/domain";
import type {
  AdminAuditEntry,
  AdminCustomerRecord,
  AdminDeliveryZone,
  AdminDispute,
  AdminDisputeResolution,
  AdminModerationItem,
  AdminOrderReview,
  AdminRoleRecord,
  AdminVendorPayoutRecord,
  AdminVendorReview,
} from "@mealhrs/domain";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { adminDashboard } from "@mealhrs/mocks";

export type AdminRoleType = "super_admin" | "operations" | "support" | "finance";

export type AdminActivityContextValue = Readonly<{
  // Role & Session
  activeRole: AdminRoleType;
  setActiveRole: (role: AdminRoleType) => void;
  checkpointsAcknowledged: boolean;
  setCheckpointsAcknowledged: (ack: boolean) => void;

  // Vendors
  vendors: readonly AdminVendorReview[];
  approveVendor: (vendorId: string, note?: string) => void;
  pauseVendor: (vendorId: string, reason?: string) => void;
  rejectVendor: (vendorId: string, reason: string) => void;

  // Customers
  customers: readonly AdminCustomerRecord[];
  toggleCustomerRestriction: (customerId: string, reason?: string) => void;

  // Orders Intervention
  orders: readonly AdminOrderReview[];
  reassignOrderCourier: (orderId: string, courier: { name: string; phone: string; fleet: string }) => void;
  recordKitchenIntervention: (orderId: string, actionNote: string) => void;
  addOrderPrepBuffer: (orderId: string, extraMinutes: number) => void;
  cancelAndRefundOrder: (orderId: string, reason: string) => void;
  markOrderReviewed: (orderId: string, note?: string) => void;

  // Disputes
  disputes: readonly AdminDispute[];
  resolveDispute: (disputeId: string, resolution: AdminDisputeResolution) => void;

  // Moderation
  moderationItems: readonly AdminModerationItem[];
  allowModerationItem: (id: string) => void;
  flagModerationItem: (id: string, reasonTag: string) => void;

  // Delivery Zones & Pricing
  deliveryZones: readonly AdminDeliveryZone[];
  toggleDeliveryZone: (areaId: string) => void;
  addDeliveryZone: (zone: AdminDeliveryZone) => void;
  surgeActive: boolean;
  toggleSurgeMode: (active?: boolean) => void;
  baseDeliveryFeeNgn: number;
  setBaseDeliveryFeeNgn: (fee: number) => void;

  // Finance & Payouts
  commissionRatePercent: number;
  setCommissionRatePercent: (rate: number) => void;
  vendorPayouts: readonly AdminVendorPayoutRecord[];
  processPayoutBatch: () => void;
  payoutBatchStatus: "idle" | "processing" | "settled";

  // Analytics
  analyticsTimeRange: "today" | "7d" | "30d";
  setAnalyticsTimeRange: (range: "today" | "7d" | "30d") => void;

  // Roles & Team
  staffRoles: readonly AdminRoleRecord[];
  inviteStaffMember: (member: { name: string; email: string; role: AdminRoleType }) => void;
  toggleStaffStatus: (id: string) => void;

  // Audit Log
  auditLog: readonly AdminAuditEntry[];
  logAuditAction: (action: string, target: string, category?: AdminAuditEntry["category"]) => void;

  // Settings & Emergency Controls
  maintenanceBannerEnabled: boolean;
  toggleMaintenanceBanner: (enabled?: boolean) => void;
  emergencyKillSwitchEnabled: boolean;
  toggleEmergencyKillSwitch: (enabled?: boolean, notice?: string) => void;
  emergencyNotice: string;
  setEmergencyNotice: (notice: string) => void;
  supportEmail: string;
  setSupportEmail: (email: string) => void;
  serviceFeeLabel: string;
  setServiceFeeLabel: (label: string) => void;
  minOrderValueNgn: number;
  setMinOrderValueNgn: (val: number) => void;
}>;

const AdminActivityContext = createContext<AdminActivityContextValue | null>(null);

export function AdminActivityProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [activeRole, setActiveRole] = useState<AdminRoleType>("super_admin");
  const [checkpointsAcknowledged, setCheckpointsAcknowledged] = useState(true);

  const [vendors, setVendors] = useState<readonly AdminVendorReview[]>(adminDashboard.vendors);
  const [customers, setCustomers] = useState<readonly AdminCustomerRecord[]>(adminDashboard.customers);
  const [orders, setOrders] = useState<readonly AdminOrderReview[]>(adminDashboard.orders);
  const [disputes, setDisputes] = useState<readonly AdminDispute[]>(adminDashboard.disputes);
  const [moderationItems, setModerationItems] = useState<readonly AdminModerationItem[]>(adminDashboard.moderation);
  const [baseDeliveryZones, setBaseDeliveryZones] = useState<readonly AdminDeliveryZone[]>(adminDashboard.deliveryZones);

  // Dynamic coverage directory: merges seeded/admin-created hubs with auto-discovered hubs from registered vendor locations
  const deliveryZones = useMemo(
    () => deriveCoverageHubs(baseDeliveryZones, vendors),
    [baseDeliveryZones, vendors],
  );

  const [surgeActive, setSurgeActive] = useState(false);
  const [baseDeliveryFeeNgn, setBaseDeliveryFeeNgn] = useState(800);

  const [commissionRatePercent, setCommissionRatePercent] = useState(8);
  const [vendorPayouts, setVendorPayouts] = useState<readonly AdminVendorPayoutRecord[]>(
    adminDashboard.finance.vendorPayouts ?? [],
  );
  const [payoutBatchStatus, setPayoutBatchStatus] = useState<"idle" | "processing" | "settled">("idle");

  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<"today" | "7d" | "30d">("7d");
  const [staffRoles, setStaffRoles] = useState<readonly AdminRoleRecord[]>(adminDashboard.roles);
  const [auditLog, setAuditLog] = useState<readonly AdminAuditEntry[]>(adminDashboard.auditLog);

  const [maintenanceBannerEnabled, setMaintenanceBannerEnabled] = useState(false);
  const [emergencyKillSwitchEnabled, setEmergencyKillSwitchEnabled] = useState(false);
  const [emergencyNotice, setEmergencyNotice] = useState(
    "Severe weather in Lagos: immediate deliveries paused for courier safety. Pre-orders remain active.",
  );
  const [supportEmail, setSupportEmail] = useState(adminDashboard.settings.supportEmail);
  const [serviceFeeLabel, setServiceFeeLabel] = useState(adminDashboard.settings.orderServiceFeeLabel);
  const [minOrderValueNgn, setMinOrderValueNgn] = useState(1500);

  const logAuditAction = useCallback(
    (action: string, target: string, category: AdminAuditEntry["category"] = "security") => {
      const now = new Date();
      const timeStr = `Today, ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
      const actorName =
        activeRole === "super_admin"
          ? "Nneka Okafor (Super Admin)"
          : activeRole === "operations"
            ? "Deji Bello (Operations)"
            : activeRole === "support"
              ? "Sade Yusuf (Support)"
              : "Kemi Adeleke (Finance)";

      const entry: AdminAuditEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        actor: actorName,
        action,
        target,
        occurredAt: timeStr,
        preview: true,
        category,
      };

      setAuditLog((current) => [entry, ...current]);
    },
    [activeRole],
  );

  const approveVendor = useCallback(
    (vendorId: string, note?: string) => {
      setVendors((current) =>
        current.map((item) =>
          item.vendor.id === vendorId
            ? { ...item, status: "approved" as const, reviewNote: note ?? "Approved by administrator" }
            : item,
        ),
      );
      const v = vendors.find((item) => item.vendor.id === vendorId);
      logAuditAction("Approved kitchen storefront", v?.vendor.name ?? vendorId, "vendor");
    },
    [vendors, logAuditAction],
  );

  const pauseVendor = useCallback(
    (vendorId: string, reason?: string) => {
      setVendors((current) =>
        current.map((item) =>
          item.vendor.id === vendorId
            ? { ...item, status: "paused" as const, rejectionReason: reason }
            : item,
        ),
      );
      const v = vendors.find((item) => item.vendor.id === vendorId);
      logAuditAction("Paused kitchen storefront", v?.vendor.name ?? vendorId, "vendor");
    },
    [vendors, logAuditAction],
  );

  const rejectVendor = useCallback(
    (vendorId: string, reason: string) => {
      setVendors((current) =>
        current.map((item) =>
          item.vendor.id === vendorId
            ? { ...item, status: "paused" as const, rejectionReason: reason, reviewNote: `Changes requested: ${reason}` }
            : item,
        ),
      );
      const v = vendors.find((item) => item.vendor.id === vendorId);
      logAuditAction("Requested compliance changes", `${v?.vendor.name ?? vendorId} (${reason})`, "vendor");
    },
    [vendors, logAuditAction],
  );

  const toggleCustomerRestriction = useCallback(
    (customerId: string, reason?: string) => {
      setCustomers((current) =>
        current.map((customer) => {
          if (customer.id !== customerId) return customer;
          const nextStatus = customer.status === "active" ? "restricted" : "active";
          return {
            ...customer,
            status: nextStatus,
            restrictionReason: nextStatus === "restricted" ? (reason ?? "Flagged by security audit") : undefined,
          };
        }),
      );
      const c = customers.find((item) => item.id === customerId);
      const nextStatus = c?.status === "active" ? "restricted" : "restored";
      logAuditAction(`Customer account ${nextStatus}`, c?.name ?? customerId, "security");
    },
    [customers, logAuditAction],
  );

  const reassignOrderCourier = useCallback(
    (orderId: string, courier: { name: string; phone: string; fleet: string }) => {
      setOrders((current) =>
        current.map((item) =>
          item.order.id === orderId
            ? {
                ...item,
                interventionStatus: "none" as const,
                interventionDetails: {
                  ...item.interventionDetails,
                  reassignedCourier: courier,
                  adminActionNote: `Courier reassigned to ${courier.name} (${courier.fleet})`,
                },
              }
            : item,
        ),
      );
      logAuditAction("Reassigned dispatch courier", `Order #${orderId} -> ${courier.name}`, "order");
    },
    [logAuditAction],
  );

  const recordKitchenIntervention = useCallback(
    (orderId: string, actionNote: string) => {
      setOrders((current) =>
        current.map((item) =>
          item.order.id === orderId
            ? {
                ...item,
                interventionStatus: "none" as const,
                interventionDetails: {
                  ...item.interventionDetails,
                  adminActionNote: actionNote,
                },
              }
            : item,
        ),
      );
      logAuditAction("Kitchen support mediation", `Order #${orderId} (${actionNote})`, "order");
    },
    [logAuditAction],
  );

  const addOrderPrepBuffer = useCallback(
    (orderId: string, extraMinutes: number) => {
      setOrders((current) =>
        current.map((item) =>
          item.order.id === orderId
            ? {
                ...item,
                interventionDetails: {
                  ...item.interventionDetails,
                  prepBufferMinutes: (item.interventionDetails?.prepBufferMinutes ?? 0) + extraMinutes,
                  adminActionNote: `Extended kitchen prep buffer by +${extraMinutes}m`,
                },
              }
            : item,
        ),
      );
      logAuditAction("Added kitchen prep buffer", `Order #${orderId} (+${extraMinutes}m)`, "order");
    },
    [logAuditAction],
  );

  const cancelAndRefundOrder = useCallback(
    (orderId: string, reason: string) => {
      setOrders((current) =>
        current.map((item) =>
          item.order.id === orderId
            ? {
                ...item,
                interventionStatus: "none" as const,
                interventionDetails: {
                  ...item.interventionDetails,
                  cancellationReason: reason,
                  adminActionNote: `Order cancelled & refunded: ${reason}`,
                },
              }
            : item,
        ),
      );
      logAuditAction("Force cancelled order & initiated refund", `Order #${orderId} (${reason})`, "order");
    },
    [logAuditAction],
  );

  const markOrderReviewed = useCallback(
    (orderId: string, note?: string) => {
      setOrders((current) =>
        current.map((item) =>
          item.order.id === orderId
            ? {
                ...item,
                interventionStatus: "none" as const,
                adminNote: note ?? "Reviewed by operations team",
              }
            : item,
        ),
      );
      logAuditAction("Marked order reviewed", `Order #${orderId}`, "order");
    },
    [logAuditAction],
  );

  const resolveDispute = useCallback(
    (disputeId: string, resolution: AdminDisputeResolution) => {
      setDisputes((current) =>
        current.map((d) =>
          d.id === disputeId
            ? {
                ...d,
                status: "resolved" as const,
                resolution,
              }
            : d,
        ),
      );
      const dispute = disputes.find((d) => d.id === disputeId);
      logAuditAction(
        `Resolved dispute (${resolution.resolutionType.replace("_", " ")})`,
        `${dispute?.topic ?? disputeId} - Order #${dispute?.orderId ?? ""}`,
        "dispute",
      );
    },
    [disputes, logAuditAction],
  );

  const allowModerationItem = useCallback(
    (id: string) => {
      setModerationItems((current) =>
        current.map((item) => (item.id === id ? { ...item, status: "visible" as const } : item)),
      );
      const item = moderationItems.find((i) => i.id === id);
      logAuditAction("Approved marketplace content", item?.title ?? id, "security");
    },
    [moderationItems, logAuditAction],
  );

  const flagModerationItem = useCallback(
    (id: string, reasonTag: string) => {
      setModerationItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "flagged" as const, flagReasonTag: reasonTag } : item,
        ),
      );
      const item = moderationItems.find((i) => i.id === id);
      logAuditAction(`Flagged content (${reasonTag})`, item?.title ?? id, "security");
    },
    [moderationItems, logAuditAction],
  );

  const toggleDeliveryZone = useCallback(
    (areaId: string) => {
      setBaseDeliveryZones((current) => {
        const exists = current.some((z) => z.areaId === areaId);
        if (exists) {
          return current.map((z) => (z.areaId === areaId ? { ...z, enabled: !z.enabled } : z));
        }
        const discovered = deliveryZones.find((z) => z.areaId === areaId);
        if (discovered) {
          return [...current, { ...discovered, enabled: !discovered.enabled }];
        }
        return current;
      });
      const zone = deliveryZones.find((z) => z.areaId === areaId);
      logAuditAction(
        zone?.enabled ? "Disabled delivery zone" : "Enabled delivery zone",
        zone?.name ?? areaId,
        "delivery",
      );
    },
    [deliveryZones, logAuditAction],
  );

  const addDeliveryZone = useCallback(
    (zone: AdminDeliveryZone) => {
      setBaseDeliveryZones((current) => [...current, zone]);
      logAuditAction("Created new delivery zone", zone.name, "delivery");
    },
    [logAuditAction],
  );

  const toggleSurgeMode = useCallback(
    (active?: boolean) => {
      setSurgeActive((prev) => {
        const next = active !== undefined ? active : !prev;
        logAuditAction(next ? "Activated Lagos traffic/rain delivery surge" : "Deactivated delivery surge", "Lagos Delivery Network", "delivery");
        return next;
      });
    },
    [logAuditAction],
  );

  const processPayoutBatch = useCallback(() => {
    setPayoutBatchStatus("processing");
    setTimeout(() => {
      setVendorPayouts((current) =>
        current.map((p) => ({ ...p, status: "settled" as const })),
      );
      setPayoutBatchStatus("settled");
      logAuditAction("Processed weekly Paystack NUBAN payout batch", `Settled ${vendorPayouts.length} vendor balances`, "finance");
    }, 1200);
  }, [vendorPayouts.length, logAuditAction]);

  const inviteStaffMember = useCallback(
    (member: { name: string; email: string; role: AdminRoleType }) => {
      const record: AdminRoleRecord = {
        id: `admin-${Date.now()}`,
        name: member.name,
        email: member.email,
        role: member.role,
        status: "invited",
      };
      setStaffRoles((current) => [...current, record]);
      logAuditAction("Invited new staff member", `${member.name} (${member.role})`, "security");
    },
    [logAuditAction],
  );

  const toggleStaffStatus = useCallback(
    (id: string) => {
      setStaffRoles((current) =>
        current.map((member) => {
          if (member.id !== id) return member;
          const next = member.status === "active" ? "invited" : "active";
          return { ...member, status: next };
        }),
      );
      const m = staffRoles.find((s) => s.id === id);
      logAuditAction("Toggled staff access status", m?.name ?? id, "security");
    },
    [staffRoles, logAuditAction],
  );

  const toggleMaintenanceBanner = useCallback(
    (enabled?: boolean) => {
      setMaintenanceBannerEnabled((prev) => {
        const next = enabled !== undefined ? enabled : !prev;
        logAuditAction(next ? "Enabled platform maintenance banner" : "Disabled platform maintenance banner", "Platform App Shell", "settings");
        return next;
      });
    },
    [logAuditAction],
  );

  const toggleEmergencyKillSwitch = useCallback(
    (enabled?: boolean, notice?: string) => {
      setEmergencyKillSwitchEnabled((prev) => {
        const next = enabled !== undefined ? enabled : !prev;
        if (notice) setEmergencyNotice(notice);
        logAuditAction(
          next ? "ENGAGED EMERGENCY PLATFORM KILL-SWITCH" : "Disengaged emergency kill-switch",
          "Marketplace Immediate Ordering Engine",
          "settings",
        );
        return next;
      });
    },
    [logAuditAction],
  );

  const value = useMemo<AdminActivityContextValue>(
    () => ({
      activeRole,
      setActiveRole,
      checkpointsAcknowledged,
      setCheckpointsAcknowledged,
      vendors,
      approveVendor,
      pauseVendor,
      rejectVendor,
      customers,
      toggleCustomerRestriction,
      orders,
      reassignOrderCourier,
      recordKitchenIntervention,
      addOrderPrepBuffer,
      cancelAndRefundOrder,
      markOrderReviewed,
      disputes,
      resolveDispute,
      moderationItems,
      allowModerationItem,
      flagModerationItem,
      deliveryZones,
      toggleDeliveryZone,
      addDeliveryZone,
      surgeActive,
      toggleSurgeMode,
      baseDeliveryFeeNgn,
      setBaseDeliveryFeeNgn,
      commissionRatePercent,
      setCommissionRatePercent,
      vendorPayouts,
      processPayoutBatch,
      payoutBatchStatus,
      analyticsTimeRange,
      setAnalyticsTimeRange,
      staffRoles,
      inviteStaffMember,
      toggleStaffStatus,
      auditLog,
      logAuditAction,
      maintenanceBannerEnabled,
      toggleMaintenanceBanner,
      emergencyKillSwitchEnabled,
      toggleEmergencyKillSwitch,
      emergencyNotice,
      setEmergencyNotice,
      supportEmail,
      setSupportEmail,
      serviceFeeLabel,
      setServiceFeeLabel,
      minOrderValueNgn,
      setMinOrderValueNgn,
    }),
    [
      activeRole,
      checkpointsAcknowledged,
      vendors,
      approveVendor,
      pauseVendor,
      rejectVendor,
      customers,
      toggleCustomerRestriction,
      orders,
      reassignOrderCourier,
      recordKitchenIntervention,
      addOrderPrepBuffer,
      cancelAndRefundOrder,
      markOrderReviewed,
      disputes,
      resolveDispute,
      moderationItems,
      allowModerationItem,
      flagModerationItem,
      deliveryZones,
      toggleDeliveryZone,
      addDeliveryZone,
      surgeActive,
      toggleSurgeMode,
      baseDeliveryFeeNgn,
      commissionRatePercent,
      vendorPayouts,
      processPayoutBatch,
      payoutBatchStatus,
      analyticsTimeRange,
      staffRoles,
      inviteStaffMember,
      toggleStaffStatus,
      auditLog,
      logAuditAction,
      maintenanceBannerEnabled,
      toggleMaintenanceBanner,
      emergencyKillSwitchEnabled,
      toggleEmergencyKillSwitch,
      emergencyNotice,
      supportEmail,
      serviceFeeLabel,
      minOrderValueNgn,
    ],
  );

  return <AdminActivityContext.Provider value={value}>{children}</AdminActivityContext.Provider>;
}

const defaultAdminActivityValue: AdminActivityContextValue = {
  activeRole: "super_admin",
  setActiveRole: () => {},
  checkpointsAcknowledged: true,
  setCheckpointsAcknowledged: () => {},

  vendors: [],
  approveVendor: () => {},
  pauseVendor: () => {},
  rejectVendor: () => {},

  customers: [],
  toggleCustomerRestriction: () => {},

  orders: [],
  reassignOrderCourier: () => {},
  recordKitchenIntervention: () => {},
  addOrderPrepBuffer: () => {},
  cancelAndRefundOrder: () => {},
  markOrderReviewed: () => {},

  disputes: [],
  resolveDispute: () => {},

  moderationItems: [],
  allowModerationItem: () => {},
  flagModerationItem: () => {},

  deliveryZones: [],
  toggleDeliveryZone: () => {},
  addDeliveryZone: () => {},
  surgeActive: false,
  toggleSurgeMode: () => {},
  baseDeliveryFeeNgn: 800,
  setBaseDeliveryFeeNgn: () => {},

  commissionRatePercent: 8,
  setCommissionRatePercent: () => {},
  vendorPayouts: [],
  processPayoutBatch: () => {},
  payoutBatchStatus: "idle",

  analyticsTimeRange: "7d",
  setAnalyticsTimeRange: () => {},

  staffRoles: [],
  inviteStaffMember: () => {},
  toggleStaffStatus: () => {},

  auditLog: [],
  logAuditAction: () => {},

  maintenanceBannerEnabled: false,
  toggleMaintenanceBanner: () => {},
  emergencyKillSwitchEnabled: false,
  toggleEmergencyKillSwitch: () => {},
  emergencyNotice: "",
  setEmergencyNotice: () => {},
  supportEmail: "support@mealhrs.example",
  setSupportEmail: () => {},
  serviceFeeLabel: "Platform service fee",
  setServiceFeeLabel: () => {},
  minOrderValueNgn: 1500,
  setMinOrderValueNgn: () => {},
};

export function useAdminActivity(): AdminActivityContextValue {
  const context = useContext(AdminActivityContext);
  return context ?? defaultAdminActivityValue;
}
