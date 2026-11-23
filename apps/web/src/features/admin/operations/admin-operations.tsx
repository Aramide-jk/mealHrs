"use client";

import {
  formatMoney,
  ngn,
  type AdminCustomerRecord,
  type AdminDispute,
  type AdminModerationItem,
  type AdminOrderReview,
  type AdminVendorReview,
} from "@mealhrs/domain";
import {
  Check,
  Clock,
  Eye,
  FileCheck,
  FileWarning,
  MapPin,
  MessageSquare,
  Pause,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { useAdminActivity } from "@/lib/admin-activity-context";
import styles from "./admin-operations.module.css";

/* -------------------------------------------------------------------------- */
/* 1. VENDOR REVIEW VIEW                                                      */
/* -------------------------------------------------------------------------- */

export function VendorReviewView({ vendors: initialVendors }: Readonly<{ vendors: readonly AdminVendorReview[] }>) {
  const { vendors, approveVendor, pauseVendor, rejectVendor } = useAdminActivity();
  const [selectedVendor, setSelectedVendor] = useState<AdminVendorReview | null>(null);
  const [rejectingVendor, setRejectingVendor] = useState<AdminVendorReview | null>(null);
  const [rejectionReason, setRejectionReason] = useState("CAC registration certificate requires clearer copy");
  const [feedback, setFeedback] = useState("");

  const activeList = vendors.length > 0 ? vendors : initialVendors;

  return (
    <Page
      title="Vendor reviews"
      eyebrow="Trust and compliance"
      description="Inspect kitchen business registration, hygiene certifications, and physical kitchen setup before granting marketplace storefront visibility."
    >
      <Queue>
        {activeList.map((item) => {
          const { reviewNote, status, submittedAt, vendor, compliance, rejectionReason: savedReason } = item;
          return (
            <article className={styles.row} key={vendor.id}>
              <div>
                <div className={styles.rowMeta}>
                  <Status tone={status === "approved" ? "success" : status === "pending_review" ? "warning" : "neutral"}>
                    {status.replaceAll("_", " ")}
                  </Status>
                  <span>Submitted {submittedAt}</span>
                  {compliance ? (
                    <span style={{ color: "var(--color-green-700)", fontWeight: 500 }}>
                      <FileCheck size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                      CAC: {compliance.cacNumber}
                    </span>
                  ) : null}
                </div>
                <h2>{vendor.name}</h2>
                <p>
                  {vendor.category} · {vendor.publicArea} · {reviewNote}
                </p>
                {savedReason ? (
                  <p style={{ marginTop: 4, color: "#b91c1c", fontSize: "0.68rem" }}>
                    Reason noted: {savedReason}
                  </p>
                ) : null}
              </div>

              <div className={styles.actions}>
                <Button size="sm" variant="secondary" onClick={() => setSelectedVendor(item)}>
                  <Eye size={15} />
                  Inspect compliance
                </Button>

                {status === "pending_review" || status === "paused" ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      approveVendor(vendor.id);
                      setFeedback(`${vendor.name} has been approved and published to the marketplace.`);
                    }}
                  >
                    <Check size={15} />
                    Approve storefront
                  </Button>
                ) : null}

                {status === "approved" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      pauseVendor(vendor.id, "Paused by administrator review");
                      setFeedback(`${vendor.name} storefront has been paused.`);
                    }}
                  >
                    <Pause size={15} />
                    Pause storefront
                  </Button>
                ) : null}

                {status !== "paused" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setRejectingVendor(item)}
                  >
                    <X size={15} />
                    Decline / Changes
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </Queue>

      {/* Compliance Inspection Drawer / Modal */}
      {selectedVendor ? (
        <Modal
          title={`Compliance Dossier: ${selectedVendor.vendor.name}`}
          onClose={() => setSelectedVendor(null)}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", position: "relative", background: "#f3f4f6" }}>
                <Image
                  src={selectedVendor.vendor.avatarUrl || "/assets/hero-jollof.png"}
                  alt={selectedVendor.vendor.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem" }}>{selectedVendor.vendor.name}</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                  {selectedVendor.vendor.category} · {selectedVendor.vendor.publicArea}
                </span>
                <div style={{ marginTop: 4 }}>
                  <Status tone={selectedVendor.status === "approved" ? "success" : "warning"}>
                    {selectedVendor.status.replace("_", " ")}
                  </Status>
                </div>
              </div>
            </div>

            <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 12, background: "#f9faf8", borderRadius: 10, fontSize: "0.74rem" }}>
              <div>
                <span style={{ color: "var(--color-muted)", display: "block" }}>CAC Business Registration</span>
                <strong>{selectedVendor.compliance?.cacNumber ?? "RC-Pending"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-muted)", display: "block" }}>Lagos State Food Safety Cert</span>
                <strong style={{ color: "var(--color-green-700)" }}>{selectedVendor.compliance?.hygieneCertNumber ?? "Verified Safe"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-muted)", display: "block" }}>Physical Prep Address</span>
                <strong>{selectedVendor.compliance?.kitchenAddress ?? selectedVendor.vendor.publicArea}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-muted)", display: "block" }}>Manager Contact Line</span>
                <strong>{selectedVendor.compliance?.managerPhone ?? "+234 800 MEALHRS"}</strong>
              </div>
            </section>

            <section style={{ padding: 12, border: "1px solid var(--color-line)", borderRadius: 10, fontSize: "0.74rem" }}>
              <strong style={{ display: "block", marginBottom: 6 }}>Verified Settlement Bank Account (NUBAN)</strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, color: "var(--color-ink)" }}>
                <div>Bank: <strong>{selectedVendor.compliance?.bankName ?? "Access Bank"}</strong></div>
                <div>Account: <strong>{selectedVendor.compliance?.accountNumber ?? "0123456789"}</strong></div>
                <div style={{ gridColumn: "1/-1" }}>Account Name: <strong>{selectedVendor.compliance?.accountName ?? selectedVendor.vendor.name}</strong></div>
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Button variant="secondary" onClick={() => setSelectedVendor(null)}>Close</Button>
              {selectedVendor.status !== "approved" ? (
                <Button
                  onClick={() => {
                    approveVendor(selectedVendor.vendor.id);
                    setSelectedVendor(null);
                    setFeedback(`${selectedVendor.vendor.name} approved.`);
                  }}
                >
                  <Check size={16} />
                  Approve kitchen now
                </Button>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Decline / Request Changes Modal */}
      {rejectingVendor ? (
        <Modal
          title={`Request Compliance Changes: ${rejectingVendor.vendor.name}`}
          onClose={() => setRejectingVendor(null)}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <p style={{ fontSize: "0.78rem", color: "var(--color-muted)", margin: 0 }}>
              Select the compliance item that requires correction before this kitchen can be published to customers:
            </p>

            <div style={{ display: "grid", gap: 8 }}>
              {[
                "CAC registration certificate requires clearer copy",
                "Lagos State Hygiene certificate has expired or requires renewal",
                "Residential kitchen location unverified by Lagos Health Officers",
                "Settlement bank account name does not match CAC business entity",
              ].map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    border: `1px solid ${rejectionReason === reason ? "var(--color-green-700)" : "var(--color-line)"}`,
                    borderRadius: 8,
                    background: rejectionReason === reason ? "var(--color-green-050)" : "#fff",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="rejection-reason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
              <Button variant="secondary" onClick={() => setRejectingVendor(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  rejectVendor(rejectingVendor.vendor.id, rejectionReason);
                  setRejectingVendor(null);
                  setFeedback(`Compliance feedback sent to ${rejectingVendor.vendor.name}.`);
                }}
              >
                Send compliance feedback
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <Feedback text={feedback} />
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. CUSTOMER REVIEW VIEW                                                    */
/* -------------------------------------------------------------------------- */

export function CustomerReviewView({ customers: initialCustomers }: Readonly<{ customers: readonly AdminCustomerRecord[] }>) {
  const { customers, toggleCustomerRestriction } = useAdminActivity();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "restricted">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerRecord | null>(null);
  const [restrictingCustomer, setRestrictingCustomer] = useState<AdminCustomerRecord | null>(null);
  const [restrictionReason, setRestrictionReason] = useState("Suspected payment chargeback fraud");
  const [feedback, setFeedback] = useState("");

  const activeList = customers.length > 0 ? customers : initialCustomers;

  const filtered = useMemo(() => {
    return activeList.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search));
      const matchesFilter = filter === "all" || c.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [activeList, search, filter]);

  return (
    <Page
      title="Customers"
      eyebrow="Account governance"
      description="Inspect customer account activity, lifetime value, delivery addresses, and security flags."
    >
      {/* Search and Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fff", border: "1px solid var(--color-line)", borderRadius: 10, width: "min(340px, 100%)" }}>
          <Search size={15} color="var(--color-muted)" />
          <input
            type="search"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", fontSize: "0.78rem" }}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "active", "restricted"] as const).map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={filter === mode ? "primary" : "secondary"}
              onClick={() => setFilter(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Queue>
        {filtered.map((customer) => {
          const { email, id, joinedAt, name, orderCount, status, phone, ltv, restrictionReason: savedReason } = customer;
          return (
            <article className={styles.row} key={id}>
              <div>
                <div className={styles.rowMeta}>
                  <Status tone={status === "active" ? "success" : "warning"}>{status}</Status>
                  <span>Joined {joinedAt}</span>
                  {phone ? <span>{phone}</span> : null}
                  {ltv ? (
                    <span style={{ fontWeight: 600, color: "var(--color-green-700)" }}>
                      LTV: {formatMoney(ltv)}
                    </span>
                  ) : null}
                </div>
                <h2>{name}</h2>
                <p>
                  {email} · {orderCount} orders completed
                </p>
                {savedReason ? (
                  <p style={{ marginTop: 4, color: "#b91c1c", fontSize: "0.68rem" }}>
                    Restriction note: {savedReason}
                  </p>
                ) : null}
              </div>

              <div className={styles.actions}>
                <Button size="sm" variant="secondary" onClick={() => setSelectedCustomer(customer)}>
                  <Eye size={15} />
                  Customer 360
                </Button>

                {status === "active" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setRestrictingCustomer(customer)}
                  >
                    <UserX size={15} />
                    Restrict account
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      toggleCustomerRestriction(id);
                      setFeedback(`${name}'s account restriction has been lifted.`);
                    }}
                  >
                    <UserCheck size={15} />
                    Restore account
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </Queue>

      {/* Customer 360 Drawer */}
      {selectedCustomer ? (
        <Modal
          title={`Customer Profile: ${selectedCustomer.name}`}
          onClose={() => setSelectedCustomer(null)}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>{selectedCustomer.name}</h3>
                <span style={{ fontSize: "0.76rem", color: "var(--color-muted)" }}>{selectedCustomer.email} · {selectedCustomer.phone ?? "+234 802 345 6789"}</span>
              </div>
              <Status tone={selectedCustomer.status === "active" ? "success" : "warning"}>
                {selectedCustomer.status}
              </Status>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: 12, background: "#f9faf8", borderRadius: 10, textAlign: "center" }}>
              <div>
                <span style={{ fontSize: "0.68rem", color: "var(--color-muted)", display: "block" }}>Orders</span>
                <strong style={{ fontSize: "1.1rem" }}>{selectedCustomer.orderCount}</strong>
              </div>
              <div>
                <span style={{ fontSize: "0.68rem", color: "var(--color-muted)", display: "block" }}>Lifetime Value</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--color-green-700)" }}>
                  {formatMoney(selectedCustomer.ltv ?? ngn(selectedCustomer.orderCount * 4500))}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: "0.68rem", color: "var(--color-muted)", display: "block" }}>Member Since</span>
                <strong style={{ fontSize: "0.85rem" }}>{selectedCustomer.joinedAt}</strong>
              </div>
            </div>

            <div>
              <strong style={{ fontSize: "0.76rem", display: "block", marginBottom: 6 }}>Saved Delivery Locations</strong>
              <div style={{ display: "grid", gap: 6 }}>
                {(selectedCustomer.addresses ?? ["12 Community Road, Ikotun, Lagos"]).map((addr, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#f8f9fa", borderRadius: 8, fontSize: "0.74rem" }}>
                    <MapPin size={14} color="var(--color-muted)" />
                    <span>{addr}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Button variant="secondary" onClick={() => setSelectedCustomer(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Restrict Account Modal */}
      {restrictingCustomer ? (
        <Modal
          title={`Restrict Account: ${restrictingCustomer.name}`}
          onClose={() => setRestrictingCustomer(null)}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <p style={{ fontSize: "0.78rem", color: "var(--color-muted)", margin: 0 }}>
              Specify the reason for temporarily restricting this customer&apos;s checkout privileges:
            </p>

            <div style={{ display: "grid", gap: 8 }}>
              {[
                "Suspected payment chargeback fraud",
                "Repeated false non-delivery dispute claims",
                "Reported abusive behavior toward dispatch rider",
                "Multiple bounced Paystack/OPay virtual transactions",
              ].map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    border: `1px solid ${restrictionReason === reason ? "var(--color-green-700)" : "var(--color-line)"}`,
                    borderRadius: 8,
                    background: restrictionReason === reason ? "var(--color-green-050)" : "#fff",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="cust-restriction-reason"
                    checked={restrictionReason === reason}
                    onChange={() => setRestrictionReason(reason)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
              <Button variant="secondary" onClick={() => setRestrictingCustomer(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  toggleCustomerRestriction(restrictingCustomer.id, restrictionReason);
                  setRestrictingCustomer(null);
                  setFeedback(`${restrictingCustomer.name} has been restricted.`);
                }}
              >
                Confirm account restriction
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <Feedback text={feedback} />
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. ORDER INTERVENTION VIEW                                                 */
/* -------------------------------------------------------------------------- */

export function OrderReviewView({ orders: initialOrders }: Readonly<{ orders: readonly AdminOrderReview[] }>) {
  const { orders, recordKitchenIntervention, addOrderPrepBuffer, cancelAndRefundOrder, markOrderReviewed } = useAdminActivity();
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderReview | null>(null);
  const [mediatingOrder, setMediatingOrder] = useState<AdminOrderReview | null>(null);
  const [mediationNote, setMediationNote] = useState("Contacted vendor: Kitchen confirmed dispatch delay resolved.");
  const [feedback, setFeedback] = useState("");

  const activeList = orders.length > 0 ? orders : initialOrders;

  return (
    <Page
      title="Order intervention"
      eyebrow="Operational mediation"
      description="Inspect in-flight orders requiring platform intervention, mediate fulfillment delays with independent kitchens, adjust preparation buffers, or execute operational cancellations."
    >
      <Queue>
        {activeList.map((item) => {
          const { adminNote, interventionStatus, order, interventionDetails } = item;
          return (
            <article className={styles.row} key={order.id}>
              <div>
                <div className={styles.rowMeta}>
                  <Status tone={interventionStatus === "none" ? "neutral" : "warning"}>
                    {interventionStatus.replaceAll("_", " ")}
                  </Status>
                  <span>Ref: {order.reference}</span>
                  <span style={{ fontWeight: 600 }}>{formatMoney(order.total)}</span>
                  <span>{order.fulfillmentStatus.replaceAll("_", " ")}</span>
                </div>
                <h2>{order.vendorName}</h2>
                <p>
                  Fulfillment: {order.fulfillmentMode} (Vendor-fulfilled) · {adminNote ?? "No active alert"}
                </p>
                {interventionDetails?.adminActionNote ? (
                  <p style={{ marginTop: 4, color: "var(--color-green-700)", fontSize: "0.68rem" }}>
                    Latest action: {interventionDetails.adminActionNote}
                  </p>
                ) : null}
              </div>

              <div className={styles.actions}>
                <Button size="sm" variant="secondary" onClick={() => setSelectedOrder(item)}>
                  <Eye size={15} />
                  Order manifest
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    addOrderPrepBuffer(order.id, 15);
                    setFeedback(`Added +15m prep buffer to Order #${order.reference}.`);
                  }}
                >
                  <Clock size={15} />
                  +15m Prep
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setMediatingOrder(item)}
                >
                  <MessageSquare size={15} />
                  Kitchen mediation
                </Button>

                {interventionStatus !== "none" ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      markOrderReviewed(order.id, "Reviewed and verified by operations");
                      setFeedback(`Order #${order.reference} marked resolved.`);
                    }}
                  >
                    <Check size={15} />
                    Mark resolved
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </Queue>

      {/* Order Manifest Modal */}
      {selectedOrder ? (
        <Modal
          title={`Order Manifest #${selectedOrder.order.reference}`}
          onClose={() => setSelectedOrder(null)}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: 12, background: "#f8f9fa", borderRadius: 10 }}>
              <div>
                <span style={{ fontSize: "0.68rem", color: "var(--color-muted)", display: "block" }}>Kitchen</span>
                <strong>{selectedOrder.order.vendorName}</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.68rem", color: "var(--color-muted)", display: "block" }}>Order Total</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--color-green-700)" }}>
                  {formatMoney(selectedOrder.order.total)}
                </strong>
              </div>
            </div>

            <div>
              <strong style={{ fontSize: "0.78rem", display: "block", marginBottom: 8 }}>Line Items Ordered</strong>
              <div style={{ display: "grid", gap: 8 }}>
                {selectedOrder.order.items.map((it) => (
                  <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#fff", border: "1px solid var(--color-line)", borderRadius: 8, fontSize: "0.76rem" }}>
                    <div>
                      <strong>{it.quantity}x {it.name}</strong>
                      {it.selectedOptions?.length ? (
                        <span style={{ display: "block", color: "var(--color-muted)", fontSize: "0.68rem" }}>
                          {it.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(", ")}
                        </span>
                      ) : null}
                    </div>
                    <span>{formatMoney(it.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 12, border: "1px solid var(--color-line)", borderRadius: 10, fontSize: "0.74rem" }}>
              <div>
                <span style={{ color: "var(--color-muted)", display: "block" }}>Fulfillment Mode</span>
                <strong>{selectedOrder.order.fulfillmentMode.toUpperCase()}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-muted)", display: "block" }}>Payment State</span>
                <strong style={{ color: "var(--color-green-700)" }}>{selectedOrder.order.paymentStatus.toUpperCase()}</strong>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <span style={{ color: "var(--color-muted)", display: "block" }}>Delivery Address</span>
                <strong>12 Community Road, Ikotun, Lagos</strong>
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  cancelAndRefundOrder(selectedOrder.order.id, "Emergency platform cancellation");
                  setSelectedOrder(null);
                  setFeedback(`Order #${selectedOrder.order.reference} cancelled & refunded.`);
                }}
              >
                <Trash2 size={14} />
                Force cancel & refund
              </Button>
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Kitchen Mediation Modal */}
      {mediatingOrder ? (
        <Modal
          title={`Kitchen Mediation: #${mediatingOrder.order.reference}`}
          onClose={() => setMediatingOrder(null)}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <p style={{ fontSize: "0.78rem", color: "var(--color-muted)", margin: 0 }}>
              Independent kitchens arrange their own deliveries or customer pickups. When delays occur, mediate with the vendor and record resolution details:
            </p>

            <div style={{ padding: "10px 12px", background: "#f8f9fa", borderRadius: 8, fontSize: "0.74rem", display: "grid", gap: 4 }}>
              <div><strong>Kitchen:</strong> {mediatingOrder.order.vendorName}</div>
              <div><strong>Fulfillment Mode:</strong> {mediatingOrder.order.fulfillmentMode.toUpperCase()}</div>
              <div><strong>Customer Reference:</strong> {mediatingOrder.order.reference}</div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Quick Mediation Notes</label>
              {[
                "Contacted vendor: Kitchen confirmed rider dispatched and en route.",
                "Contacted vendor: Kitchen requested 15-minute preparation extension.",
                "Customer and vendor aligned: Order handoff confirmed.",
                "Vendor unreachable: Order pending review for cancellation.",
              ].map((note) => (
                <button
                  type="button"
                  key={note}
                  onClick={() => setMediationNote(note)}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 6,
                    fontSize: "0.72rem",
                    border: `1px solid ${mediationNote === note ? "var(--color-green-700)" : "var(--color-line)"}`,
                    background: mediationNote === note ? "var(--color-green-050)" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  {note}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="custom-mediation-note" style={{ fontSize: "0.74rem", fontWeight: 600 }}>Custom Resolution Note</label>
              <textarea
                id="custom-mediation-note"
                rows={3}
                value={mediationNote}
                onChange={(e) => setMediationNote(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: "0.76rem",
                  border: "1px solid var(--color-line)",
                  borderRadius: 6,
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
              <Button variant="secondary" onClick={() => setMediatingOrder(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  recordKitchenIntervention(mediatingOrder.order.id, mediationNote);
                  setMediatingOrder(null);
                  setFeedback(`Mediation logged for Order #${mediatingOrder.order.reference}.`);
                }}
              >
                Save mediation log
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <Feedback text={feedback} />
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. DISPUTES VIEW                                                           */
/* -------------------------------------------------------------------------- */

export function DisputesView({ disputes: initialDisputes }: Readonly<{ disputes: readonly AdminDispute[] }>) {
  const { disputes, resolveDispute } = useAdminActivity();
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null);
  const [resolutionType, setResolutionType] = useState<"full_refund" | "partial_refund" | "voucher" | "dismissed">("full_refund");
  const [deductionSource, setDeductionSource] = useState<"vendor_payout" | "platform_goodwill">("vendor_payout");
  const [feedback, setFeedback] = useState("");

  const activeList = disputes.length > 0 ? disputes : initialDisputes;

  return (
    <Page
      title="Disputes & resolutions"
      eyebrow="Customer trust"
      description="Review customer complaints with photographic proof, evaluate packaging or timing issues, and execute refunds or vouchers."
    >
      <Queue>
        {activeList.map((dispute) => {
          const { customerName, id, openedAt, orderId, status, topic, claimDetails, resolution } = dispute;
          return (
            <article className={styles.row} key={id}>
              <div>
                <div className={styles.rowMeta}>
                  <Status tone={status === "resolved" ? "success" : "warning"}>
                    {status.replaceAll("_", " ")}
                  </Status>
                  <span>Opened {openedAt}</span>
                  <span>Order Ref: {orderId}</span>
                </div>
                <h2>{topic}</h2>
                <p>
                  Claim by {customerName} · {claimDetails ?? "Customer reported delivery issue."}
                </p>
                {resolution ? (
                  <p style={{ marginTop: 4, color: "var(--color-green-700)", fontSize: "0.68rem" }}>
                    Resolution: {resolution.resolutionType.replace("_", " ").toUpperCase()} (Charged to {resolution.deductionSource.replace("_", " ")})
                  </p>
                ) : null}
              </div>

              <div className={styles.actions}>
                <Button size="sm" variant="secondary" onClick={() => setSelectedDispute(dispute)}>
                  <Eye size={15} />
                  Inspect claim & evidence
                </Button>

                {status !== "resolved" ? (
                  <Button size="sm" onClick={() => setSelectedDispute(dispute)}>
                    <Check size={15} />
                    Resolve dispute
                  </Button>
                ) : (
                  <Status tone="success">Resolved claim</Status>
                )}
              </div>
            </article>
          );
        })}
      </Queue>

      {/* Dispute Resolution Modal */}
      {selectedDispute ? (
        <Modal
          title={`Dispute Review: ${selectedDispute.topic}`}
          onClose={() => setSelectedDispute(null)}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <strong style={{ fontSize: "0.78rem", color: "#991b1b" }}>Customer Claim: {selectedDispute.customerName}</strong>
                <span style={{ fontSize: "0.68rem", color: "#b91c1c" }}>Order #{selectedDispute.orderId}</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.74rem", color: "#7f1d1d" }}>
                {selectedDispute.claimDetails ?? "The food packaging leaked during courier transit and arrived cold."}
              </p>
            </div>

            {/* Evidence Image Preview */}
            <div>
              <strong style={{ fontSize: "0.74rem", display: "block", marginBottom: 6 }}>Submitted Photographic Evidence</strong>
              <div style={{ position: "relative", width: "100%", height: 160, borderRadius: 10, overflow: "hidden", background: "#f3f4f6" }}>
                <Image
                  src={selectedDispute.evidenceImageUrl ?? "/assets/egusi-pounded-yam.png"}
                  alt="Customer evidence photo"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>

            {/* Resolution Selector */}
            {selectedDispute.status !== "resolved" ? (
              <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
                <label style={{ fontSize: "0.74rem", fontWeight: 600 }}>Select Resolution Type:</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { id: "full_refund", label: "Full Refund (100%)", desc: "Refund to customer card/wallet" },
                    { id: "partial_refund", label: "Partial Refund (50%)", desc: "Refund damaged item portion" },
                    { id: "voucher", label: "Apology Voucher", desc: "Issue NGN 1,500 credit" },
                    { id: "dismissed", label: "Dismiss Claim", desc: "Verified delivery intact" },
                  ].map((res) => (
                    <label
                      key={res.id}
                      style={{
                        padding: "8px 10px",
                        border: `1px solid ${resolutionType === res.id ? "var(--color-green-700)" : "var(--color-line)"}`,
                        borderRadius: 8,
                        background: resolutionType === res.id ? "var(--color-green-050)" : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="resolution-type"
                        checked={resolutionType === res.id}
                        onChange={() => setResolutionType(res.id as typeof resolutionType)}
                      />
                      <strong style={{ display: "block", fontSize: "0.72rem", marginTop: 2 }}>{res.label}</strong>
                      <span style={{ fontSize: "0.62rem", color: "var(--color-muted)" }}>{res.desc}</span>
                    </label>
                  ))}
                </div>

                <label style={{ fontSize: "0.74rem", fontWeight: 600, marginTop: 4 }}>Settlement Liability:</label>
                <div style={{ display: "flex", gap: 12 }}>
                  <label style={{ fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="deduction-src"
                      checked={deductionSource === "vendor_payout"}
                      onChange={() => setDeductionSource("vendor_payout")}
                    />
                    <span>Deduct from Vendor Settlement</span>
                  </label>
                  <label style={{ fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="deduction-src"
                      checked={deductionSource === "platform_goodwill"}
                      onChange={() => setDeductionSource("platform_goodwill")}
                    />
                    <span>Absorb by MealHrs Platform</span>
                  </label>
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
              <Button variant="secondary" onClick={() => setSelectedDispute(null)}>Close</Button>
              {selectedDispute.status !== "resolved" ? (
                <Button
                  onClick={() => {
                    resolveDispute(selectedDispute.id, {
                      resolutionType,
                      deductionSource,
                    });
                    setSelectedDispute(null);
                    setFeedback(`Dispute ${selectedDispute.id} resolved (${resolutionType.replace("_", " ")}).`);
                  }}
                >
                  <Check size={16} />
                  Execute resolution
                </Button>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      <Feedback text={feedback} />
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. MODERATION VIEW                                                         */
/* -------------------------------------------------------------------------- */

export function ModerationView({ items: initialItems }: Readonly<{ items: readonly AdminModerationItem[] }>) {
  const { moderationItems, allowModerationItem, flagModerationItem } = useAdminActivity();
  const [tab, setTab] = useState<"all" | "dish" | "meal_drop" | "post" | "review">("all");
  const [flaggingItem, setFlaggingItem] = useState<AdminModerationItem | null>(null);
  const [flagReasonTag, setFlagReasonTag] = useState("Misleading meal photography");
  const [feedback, setFeedback] = useState("");

  const activeList = moderationItems.length > 0 ? moderationItems : initialItems;

  const filtered = useMemo(() => {
    if (tab === "all") return activeList;
    return activeList.filter((item) => item.kind === tab);
  }, [activeList, tab]);

  return (
    <Page
      title="Content & reels moderation"
      eyebrow="Marketplace safety"
      description="Review dish photos, scheduled Meal Drop banners, video Reels, and customer storefront reviews before or after publication."
    >
      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
        {[
          { id: "all", label: "All Items" },
          { id: "dish", label: "Dishes" },
          { id: "meal_drop", label: "Meal Drops" },
          { id: "post", label: "Reels / Posts" },
          { id: "review", label: "Customer Reviews" },
        ].map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={tab === t.id ? "primary" : "secondary"}
            onClick={() => setTab(t.id as typeof tab)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <Queue>
        {filtered.map((item) => {
          const { id, kind, reason, status, title, vendorName, mediaUrl, reviewComment, flagReasonTag: savedTag } = item;
          return (
            <article className={styles.row} key={id}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {mediaUrl ? (
                  <div style={{ position: "relative", width: 68, height: 68, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f3f4f6" }}>
                    <Image src={mediaUrl} alt={title} fill style={{ objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ width: 68, height: 68, borderRadius: 10, background: "#f3f4f6", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <MessageSquare size={24} color="var(--color-muted)" />
                  </div>
                )}

                <div>
                  <div className={styles.rowMeta}>
                    <Status tone={status === "visible" ? "success" : status === "flagged" ? "danger" : "warning"}>
                      {status.replaceAll("_", " ")}
                    </Status>
                    <span style={{ textTransform: "uppercase", fontWeight: 600 }}>{kind.replaceAll("_", " ")}</span>
                    <span>{vendorName}</span>
                  </div>
                  <h2>{title}</h2>
                  {reviewComment ? (
                    <p style={{ fontStyle: "italic", color: "var(--color-ink)", marginTop: 2 }}>
                      &ldquo;{reviewComment}&rdquo;
                    </p>
                  ) : null}
                  <p>{reason ? `Flag notice: ${reason}` : "Marketplace submission awaiting check"}</p>
                  {savedTag ? (
                    <p style={{ color: "#b91c1c", marginTop: 2, fontSize: "0.68rem" }}>
                      Tag: {savedTag}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className={styles.actions}>
                <Button
                  size="sm"
                  onClick={() => {
                    allowModerationItem(id);
                    setFeedback(`${title} approved and marked visible.`);
                  }}
                >
                  <ShieldCheck size={15} />
                  Allow visible
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setFlaggingItem(item)}
                >
                  <FileWarning size={15} />
                  Flag content
                </Button>
              </div>
            </article>
          );
        })}
      </Queue>

      {/* Flag Content Dialog */}
      {flaggingItem ? (
        <Modal
          title={`Flag Content: ${flaggingItem.title}`}
          onClose={() => setFlaggingItem(null)}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <p style={{ fontSize: "0.78rem", color: "var(--color-muted)", margin: 0 }}>
              Tag the specific violation before hiding this item from customer feeds:
            </p>

            <div style={{ display: "grid", gap: 8 }}>
              {[
                "Misleading meal photography or stolen assets",
                "Unapproved alcohol / prohibited consumable item",
                "Inappropriate caption or offensive profanity",
                "Low video/image resolution under quality bar",
              ].map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    border: `1px solid ${flagReasonTag === reason ? "var(--color-green-700)" : "var(--color-line)"}`,
                    borderRadius: 8,
                    background: flagReasonTag === reason ? "var(--color-green-050)" : "#fff",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="flag-reason-tag"
                    checked={flagReasonTag === reason}
                    onChange={() => setFlagReasonTag(reason)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
              <Button variant="secondary" onClick={() => setFlaggingItem(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  flagModerationItem(flaggingItem.id, flagReasonTag);
                  setFlaggingItem(null);
                  setFeedback(`${flaggingItem.title} has been flagged and hidden.`);
                }}
              >
                Confirm flag
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <Feedback text={feedback} />
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* REUSABLE ADMIN UI PRIMITIVES                                               */
/* -------------------------------------------------------------------------- */

function Page({
  children,
  description,
  eyebrow,
  title,
}: Readonly<{ children: React.ReactNode; description: string; eyebrow: string; title: string }>) {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>
      </header>
      {children}
    </div>
  );
}

function Queue({ children }: Readonly<{ children: React.ReactNode }>) {
  return <section className={styles.queue}>{children}</section>;
}

function Feedback({ text }: Readonly<{ text: string }>) {
  if (!text) return null;
  return (
    <p className={styles.feedback} role="status">
      <UserRound size={15} />
      {text}
    </p>
  );
}

function Modal({
  title,
  children,
  onClose,
}: Readonly<{ title: string; children: React.ReactNode; onClose: () => void }>) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(18, 25, 20, 0.45)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          width: "min(560px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          border: "1px solid var(--color-line)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: "1.1rem" }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-muted)", padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
