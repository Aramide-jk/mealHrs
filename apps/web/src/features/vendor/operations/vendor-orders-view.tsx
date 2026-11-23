"use client";

import { formatMoney, ngn, type VendorOrder } from "@mealhrs/domain";
import * as Dialog from "@radix-ui/react-dialog";
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock3,
  MessageCircle,
  PackageCheck,
  Search,
  Truck,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, type FormEvent, type MouseEvent, type MutableRefObject } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import {
  ORDER_TIMELINE_STEPS,
  aggregatePreparationList,
  initialOrderStage,
  isStageActionable,
  nextActionLabel,
  nextStage,
  orderLineTotalAmount,
  stageLabel,
  type VendorOrderStage,
} from "./vendor-order-helpers";
import styles from "./vendor-operations.module.css";
import { useCustomerActivity } from "@/lib/customer-activity-context";

type OrderState = "immediate" | "drop";
type FulfillmentFilter = "all" | "delivery" | "pickup";
type StatusFilter =
  | "all"
  | "pending_vendor"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
type SortOrder = "newest" | "oldest" | "priority";

const tabs: readonly OrderState[] = ["immediate", "drop"];
const priorityValue = (priority: VendorOrder["operational"]["priority"]) =>
  priority === "attention" ? 0 : priority === "due_soon" ? 1 : 2;

export function VendorOrdersView({
  immediateOrders,
  mealDropOrders,
}: Readonly<{
  immediateOrders: readonly VendorOrder[];
  mealDropOrders: readonly VendorOrder[];
}>) {
  const [tab, setTab] = useState<OrderState>("immediate");
  const [fulfillment, setFulfillment] = useState<FulfillmentFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [query, setQuery] = useState("");
  const { updateOrderStage, getOrderStage } = useCustomerActivity();
  const [stages, setStages] = useState<Record<string, VendorOrderStage>>({});
  const [cancelNotes, setCancelNotes] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(immediateOrders[0]?.id ?? null);
  const [dialogOrder, setDialogOrder] = useState<VendorOrder | null>(null);
  const [cancelOrder, setCancelOrder] = useState<VendorOrder | null>(null);
  const [prepOpen, setPrepOpen] = useState(false);

  const tabRefs = useRef<Partial<Record<OrderState, HTMLButtonElement | null>>>({});
  const detailsTrigger = useRef<HTMLButtonElement | null>(null);
  const allOrders = useMemo(() => [...immediateOrders, ...mealDropOrders], [immediateOrders, mealDropOrders]);
  const activeIndex = tabs.indexOf(tab);

  const getStage = (order: VendorOrder): VendorOrderStage =>
    stages[order.id] ?? getOrderStage(order.reference) ?? getOrderStage(order.id) ?? initialOrderStage(order);

  const source = (tab === "immediate" ? immediateOrders : mealDropOrders).filter(
    (order) => order.orderingMode === (tab === "immediate" ? "immediate" : "meal_drop"),
  );

  const filteredOrders = source.filter((order) => {
    const matchesFulfillment = fulfillment === "all" || order.fulfillmentMode === fulfillment;
    const matchesStatus = statusFilter === "all" || getStage(order) === statusFilter;
    const searchable = `${order.reference} ${order.customer.name} ${order.items.map((item) => item.name).join(" ")}`.toLowerCase();
    return matchesFulfillment && matchesStatus && searchable.includes(query.trim().toLowerCase());
  });

  const orders = [...filteredOrders].sort((first, second) =>
    sortOrder === "priority"
      ? priorityValue(first.operational.priority) - priorityValue(second.operational.priority)
      : (sortOrder === "newest" ? -1 : 1) * first.createdAt.localeCompare(second.createdAt),
  );

  const selectedOrder = orders.find((order) => order.id === selectedId) ?? orders[0] ?? null;
  const mealDropContext = orders.find((order) => order.operational.mealDrop)?.operational.mealDrop;
  const summary = buildSummary(allOrders, getStage);
  const prepItems = aggregatePreparationList(source, getStage);

  const switchTab = (next: OrderState) => {
    setTab(next);
    setFulfillment("all");
    setStatusFilter("all");
    setQuery("");
    setSelectedId(null);
  };

  const selectWithArrow = (key: string) => {
    if (key === "ArrowLeft" || key === "ArrowRight") {
      const next = tabs[(activeIndex + (key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length]!;
      switchTab(next);
      tabRefs.current[next]?.focus();
    }
  };

  const advance = (order: VendorOrder) => {
    const current = getStage(order);
    const updated = nextStage(current, order.fulfillmentMode);
    setStages((prev) => ({ ...prev, [order.id]: updated }));
    updateOrderStage(order.reference, updated);
    updateOrderStage(order.id, updated);
    setSelectedId(order.id);
    setFeedback(`${order.reference} is marked ${stageLabel(updated)} in this frontend preview only.`);
  };

  const submitCancellation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cancelOrder) return;
    const form = new FormData(event.currentTarget);
    const reason = String(form.get("reason") ?? "Kitchen capacity reached");
    const note = String(form.get("note") ?? "").trim();
    const fullReason = note ? `${reason} — ${note}` : reason;
    setStages((prev) => ({ ...prev, [cancelOrder.id]: "cancelled" }));
    setCancelNotes((prev) => ({ ...prev, [cancelOrder.id]: fullReason }));
    updateOrderStage(cancelOrder.reference, "cancelled", fullReason);
    updateOrderStage(cancelOrder.id, "cancelled", fullReason);
    setFeedback(
      `${cancelOrder.reference} marked cancelled (${reason}) in this frontend preview. No customer refund was issued.`,
    );
    setCancelOrder(null);
  };

  const showDetails = (order: VendorOrder, event: MouseEvent<HTMLButtonElement>) => {
    detailsTrigger.current = event.currentTarget;
    setSelectedId(order.id);
    if (window.matchMedia("(max-width: 980px)").matches) setDialogOrder(order);
  };

  const contactPreview = (order: VendorOrder) =>
    setFeedback(`${order.customer.name} contact is a frontend preview only; no call or message was sent.`);

  const copyPrepSummary = async () => {
    const text = prepItems.length
      ? prepItems
          .map(
            (entry) =>
              `${entry.totalQuantity}× ${entry.dishName}` +
              (entry.optionCounts.length
                ? ` (${entry.optionCounts.map((option) => `${option.count}× ${option.label}`).join(", ")})`
                : ""),
          )
          .join("\n")
      : "No active dishes to prepare.";
    try {
      await navigator.clipboard.writeText(text);
      setFeedback("Preparation list copied in this frontend preview.");
    } catch {
      setFeedback("Preparation summary is ready above for printing or review.");
    }
  };

  return (
    <div className={styles.ordersPage}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Operations</p>
          <h1>Orders</h1>
          <p>Manage incoming orders, preparation, and fulfilment — all in one place.</p>
        </div>
        <div className={styles.headActions}>
          <Button size="sm" variant="secondary" onClick={() => setPrepOpen(true)}>
            <ClipboardList aria-hidden="true" size={16} />
            Preparation list
          </Button>
        </div>
      </header>

      {feedback ? (
        <p className={styles.feedback} role="status">
          {feedback}
        </p>
      ) : null}

      <OrderSummary summary={summary} />
      <OrderTabs
        tab={tab}
        tabRefs={tabRefs}
        onChange={switchTab}
        onArrow={selectWithArrow}
        immediateCount={immediateOrders.length}
        dropCount={mealDropOrders.length}
      />

      <div className={styles.workspace}>
        <div className={styles.queue}>
          <QueueTools
            tab={tab}
            query={query}
            fulfillment={fulfillment}
            statusFilter={statusFilter}
            sortOrder={sortOrder}
            onQuery={setQuery}
            onFulfillment={setFulfillment}
            onStatus={setStatusFilter}
            onSort={setSortOrder}
          />
          {tab === "drop" && mealDropContext ? <MealDropSummary context={mealDropContext} /> : null}
          <section
            id={`vendor-orders-panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`vendor-orders-tab-${tab}`}
            className={styles.list}
            aria-live="polite"
          >
            {orders.length ? (
              orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  stage={getStage(order)}
                  selected={selectedOrder?.id === order.id}
                  onAdvance={advance}
                  onDetails={showDetails}
                />
              ))
            ) : (
              <article className={`card ${styles.empty}`}>
                <h2>No matching {tab === "drop" ? "pre-order batch" : "immediate"} orders</h2>
                <p>Try another status, fulfilment filter, or search term.</p>
              </article>
            )}
          </section>
          {tab === "immediate" && mealDropOrders.length ? (
            <UpcomingDrop order={mealDropOrders[0]!} onView={() => switchTab("drop")} />
          ) : null}
        </div>

        <aside className={styles.detailsPanel} aria-label="Selected order details">
          {selectedOrder ? (
            <OrderDetails
              order={selectedOrder}
              stage={getStage(selectedOrder)}
              cancelNote={cancelNotes[selectedOrder.id]}
              onAdvance={advance}
              onContact={contactPreview}
              onOpenCancel={() => setCancelOrder(selectedOrder)}
            />
          ) : (
            <EmptyDetails />
          )}
        </aside>
      </div>

      <OrderDetailsDialog
        order={dialogOrder}
        stage={dialogOrder ? getStage(dialogOrder) : "pending_vendor"}
        cancelNote={dialogOrder ? cancelNotes[dialogOrder.id] : undefined}
        onOpenChange={(open) => {
          if (!open) setDialogOrder(null);
        }}
        onContact={contactPreview}
        onAdvance={advance}
        onOpenCancel={() => {
          if (dialogOrder) {
            setCancelOrder(dialogOrder);
            setDialogOrder(null);
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(() => detailsTrigger.current?.focus());
        }}
      />

      <Dialog.Root open={prepOpen} onOpenChange={setPrepOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.menuDialogBackdrop} />
          <Dialog.Content className={styles.menuDialog} aria-modal="true">
            <header>
              <div>
                <p className={styles.eyebrow}>{tab === "drop" ? "Batch prep" : "Active kitchen prep"}</p>
                <Dialog.Title>Preparation list</Dialog.Title>
                <Dialog.Description>
                  Grouped dish counts, proteins, extras, and customer notes for active {tab === "drop" ? "pre-order batch" : "immediate"} orders.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className={styles.close} type="button" aria-label="Close preparation list">
                  <X aria-hidden="true" />
                </button>
              </Dialog.Close>
            </header>
            <div className={styles.prepCard}>
              {prepItems.length ? (
                <div className={styles.prepGrid}>
                  {prepItems.map((entry) => (
                    <article className={styles.prepItem} key={entry.dishName}>
                      <h3>
                        {entry.totalQuantity}× {entry.dishName}
                      </h3>
                      {entry.optionCounts.length ? (
                        <ul>
                          {entry.optionCounts.map((option) => (
                            <li key={option.label}>
                              {option.count}× {option.label}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No modifiers selected</p>
                      )}
                      {entry.instructions.length ? (
                        <p className={styles.note}>{entry.instructions.join(" · ")}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <Notice tone="info">No active orders require preparation in this tab right now.</Notice>
              )}
              <div className="split">
                <Button size="sm" variant="secondary" type="button" onClick={() => void copyPrepSummary()}>
                  Copy summary
                </Button>
                <Dialog.Close asChild>
                  <Button size="sm" type="button">
                    Done
                  </Button>
                </Dialog.Close>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={Boolean(cancelOrder)} onOpenChange={(open) => !open && setCancelOrder(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.menuDialogBackdrop} />
          {cancelOrder ? (
            <Dialog.Content className={styles.menuDialog} aria-modal="true">
              <header>
                <div>
                  <p className={styles.eyebrow}>Order exception</p>
                  <Dialog.Title>Cancel or report issue · {cancelOrder.reference}</Dialog.Title>
                  <Dialog.Description>
                    Record why the kitchen cannot fulfil or deliver this order. No real refund is triggered in preview mode.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className={styles.close} type="button" aria-label="Close order exception dialog">
                    <X aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </header>
              <form onSubmit={submitCancellation}>
                <label>
                  Reason
                  <select name="reason" defaultValue="Out of ingredients">
                    <option>Out of ingredients</option>
                    <option>Kitchen capacity full</option>
                    <option>Cannot arrange delivery</option>
                    <option>Customer requested cancellation</option>
                  </select>
                </label>
                <label>
                  Operational note (optional)
                  <textarea name="note" maxLength={240} placeholder="Context for customer support and audit history" />
                </label>
                <footer>
                  <Button type="submit" variant="danger" block>
                    Mark cancelled (preview)
                  </Button>
                </footer>
              </form>
            </Dialog.Content>
          ) : null}
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function buildSummary(orders: readonly VendorOrder[], stageFor: (order: VendorOrder) => VendorOrderStage) {
  const activeOrders = orders.filter((order) => {
    const stage = stageFor(order);
    return stage !== "delivered" && stage !== "cancelled";
  });
  return [
    { label: "New", value: activeOrders.filter((order) => stageFor(order) === "pending_vendor").length, icon: PackageCheck, tone: "new" },
    {
      label: "Preparing",
      value: activeOrders.filter((order) => ["confirmed", "preparing"].includes(stageFor(order))).length,
      icon: Clock3,
      tone: "preparing",
    },
    {
      label: "Ready",
      value: activeOrders.filter((order) => ["ready", "out_for_delivery"].includes(stageFor(order))).length,
      icon: PackageCheck,
      tone: "ready",
    },
    {
      label: "Due soon",
      value: activeOrders.filter((order) => order.operational.priority === "due_soon").length,
      icon: Clock3,
      tone: "due",
    },
    {
      label: "Scheduled",
      value: activeOrders.filter((order) => order.orderingMode === "meal_drop").length,
      icon: CalendarDays,
      tone: "scheduled",
    },
  ] as const;
}

function OrderSummary({ summary }: Readonly<{ summary: ReturnType<typeof buildSummary> }>) {
  return (
    <section className={styles.summary} aria-label="Order status summary">
      {summary.map(({ label, value, icon: Icon, tone }) => (
        <article className={styles.summaryTile} data-tone={tone} key={label}>
          <Icon aria-hidden="true" />
          <span>
            <small>{label}</small>
            <strong>{value}</strong>
          </span>
        </article>
      ))}
    </section>
  );
}

function OrderTabs({
  tab,
  tabRefs,
  onChange,
  onArrow,
  immediateCount,
  dropCount,
}: Readonly<{
  tab: OrderState;
  tabRefs: MutableRefObject<Partial<Record<OrderState, HTMLButtonElement | null>>>;
  onChange: (tab: OrderState) => void;
  onArrow: (key: string) => void;
  immediateCount: number;
  dropCount: number;
}>) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Order type">
      {tabs.map((candidate) => (
        <button
          ref={(node) => {
            tabRefs.current[candidate] = node;
          }}
          key={candidate}
          id={`vendor-orders-tab-${candidate}`}
          role="tab"
          aria-controls={`vendor-orders-panel-${candidate}`}
          aria-selected={tab === candidate}
          tabIndex={tab === candidate ? 0 : -1}
          onKeyDown={(event) => onArrow(event.key)}
          onClick={() => onChange(candidate)}
        >
          {candidate === "immediate" ? `Immediate (${immediateCount})` : `Meal Drops (${dropCount})`}
        </button>
      ))}
    </div>
  );
}

function QueueTools({
  tab,
  query,
  fulfillment,
  statusFilter,
  sortOrder,
  onQuery,
  onFulfillment,
  onStatus,
  onSort,
}: Readonly<{
  tab: OrderState;
  query: string;
  fulfillment: FulfillmentFilter;
  statusFilter: StatusFilter;
  sortOrder: SortOrder;
  onQuery: (value: string) => void;
  onFulfillment: (value: FulfillmentFilter) => void;
  onStatus: (value: StatusFilter) => void;
  onSort: (value: SortOrder) => void;
}>) {
  return (
    <section className={styles.orderTools} aria-label="Order queue controls">
      <label className={styles.search} htmlFor="vendor-order-search">
        <Search aria-hidden="true" />
        <span className="sr-only">Search {tab === "drop" ? "pre-order batch" : "immediate"} orders</span>
        <input
          id="vendor-order-search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search order, customer or meal"
        />
      </label>
      <label className={styles.selectControl}>
        <span className="sr-only">Order status</span>
        <select value={statusFilter} onChange={(event) => onStatus(event.target.value as StatusFilter)}>
          <option value="all">Status</option>
          <option value="pending_vendor">New</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="out_for_delivery">Out for delivery</option>
          <option value="delivered">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <ChevronDown aria-hidden="true" />
      </label>
      <div className={styles.filters} aria-label="Fulfilment filter">
        {(["all", "delivery", "pickup"] as const).map((candidate) => (
          <button
            type="button"
            key={candidate}
            aria-pressed={fulfillment === candidate}
            onClick={() => onFulfillment(candidate)}
          >
            {candidate === "all" ? "All fulfilment" : candidate === "delivery" ? "Delivery" : "Pickup"}
          </button>
        ))}
      </div>
      <label className={styles.selectControl}>
        <span className="sr-only">Sort orders</span>
        <select value={sortOrder} onChange={(event) => onSort(event.target.value as SortOrder)}>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="priority">Sort: Priority</option>
        </select>
        <ChevronDown aria-hidden="true" />
      </label>
    </section>
  );
}

function MealDropSummary({ context }: Readonly<{ context: NonNullable<VendorOrder["operational"]["mealDrop"]> }>) {
  return (
    <section className={`card ${styles.dropSummary}`} aria-label="Meal Drop preparation summary">
      <CalendarDays aria-hidden="true" />
      <div>
        <strong>{context.name}</strong>
        <p>Scheduled meal batch with a cutoff and batch prep.</p>
      </div>
      <dl>
        <div>
          <dt>Cutoff</dt>
          <dd>{context.cutoffLabel}</dd>
        </div>
        <div>
          <dt>Batch prep</dt>
          <dd>{context.preparationWindow}</dd>
        </div>
      </dl>
      <div className={styles.dropCapacity}>
        <span>{context.capacityLabel}</span>
        <small>{context.summary}</small>
      </div>
    </section>
  );
}

function UpcomingDrop({ order, onView }: Readonly<{ order: VendorOrder; onView: () => void }>) {
  const context = order.operational.mealDrop;
  if (!context) return null;
  return (
    <section className={`card ${styles.upcomingDrop}`}>
      <CalendarDays aria-hidden="true" />
      <div>
        <strong>Pre-order Batches — upcoming pre-orders</strong>
        <p>Scheduled meal batches with a cutoff and batch prep.</p>
      </div>
      <button type="button" onClick={onView}>
        View all <span aria-hidden="true">→</span>
      </button>
      <div className={styles.upcomingDropMeta}>
        <strong>{context.name}</strong>
        <span>{context.summary}</span>
        <span>{context.cutoffLabel}</span>
        <span>{context.preparationWindow}</span>
      </div>
    </section>
  );
}

function stageTone(stage: VendorOrderStage, priority: VendorOrder["operational"]["priority"]) {
  if (stage === "cancelled") return "danger" as const;
  if (stage === "delivered") return "neutral" as const;
  if (stage === "ready" || stage === "out_for_delivery") return "success" as const;
  if (priority === "attention") return "danger" as const;
  return "warning" as const;
}

function OrderRow({
  order,
  stage,
  selected,
  onAdvance,
  onDetails,
}: Readonly<{
  order: VendorOrder;
  stage: VendorOrderStage;
  selected: boolean;
  onAdvance: (order: VendorOrder) => void;
  onDetails: (order: VendorOrder, event: MouseEvent<HTMLButtonElement>) => void;
}>) {
  const actionable = isStageActionable(stage);
  return (
    <article className={`card ${styles.order} ${selected ? styles.selected : ""}`} aria-current={selected ? "true" : undefined}>
      <div className={styles.orderMain}>
        <div className="cluster">
          <Status tone={stageTone(stage, order.operational.priority)}>{stageLabel(stage)}</Status>
          <span className={styles.reference}>{order.reference}</span>
          <span className={styles.mode}>
            <Truck aria-hidden="true" />
            {order.fulfillmentMode === "pickup" ? "Pickup" : "Delivery"}
          </span>
        </div>
        <h2>{order.customer.name}</h2>
        <p className={styles.items}>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</p>
        <div className={styles.facts}>
          <span>{order.operational.ageLabel}</span>
          <span>{order.fulfillmentWindow}</span>
          <span data-payment={order.paymentStatus}>{order.operational.paymentLabel}</span>
        </div>
      </div>
      <strong className={styles.total}>{formatMoney(order.total)}</strong>
      <div className={styles.actionGroup}>
        {actionable ? (
          <Button size="sm" onClick={() => onAdvance(order)}>
            {nextActionLabel(stage, order.fulfillmentMode)}
          </Button>
        ) : (
          <Button size="sm" variant="secondary" disabled>
            {stageLabel(stage)}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={(event) => onDetails(order, event)}>
          Details
        </Button>
      </div>
    </article>
  );
}

function OrderDetailsDialog({
  order,
  stage,
  cancelNote,
  onOpenChange,
  onContact,
  onAdvance,
  onOpenCancel,
  onCloseAutoFocus,
}: Readonly<{
  order: VendorOrder | null;
  stage: VendorOrderStage;
  cancelNote?: string | undefined;
  onOpenChange: (open: boolean) => void;
  onContact: (order: VendorOrder) => void;
  onAdvance: (order: VendorOrder) => void;
  onOpenCancel: () => void;
  onCloseAutoFocus: (event: Event) => void;
}>) {
  return (
    <Dialog.Root open={Boolean(order)} onOpenChange={onOpenChange}>
      {order ? (
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogBackdrop} />
          <Dialog.Content
            className={styles.dialog}
            aria-describedby="order-details-summary"
            onCloseAutoFocus={onCloseAutoFocus}
          >
            <Dialog.Title className="sr-only">Order {order.reference}</Dialog.Title>
            <p id="order-details-summary" className="sr-only">
              Order details and locally simulated fulfilment actions.
            </p>
            <OrderDetails
              order={order}
              stage={stage}
              cancelNote={cancelNote}
              onAdvance={onAdvance}
              onContact={onContact}
              onOpenCancel={onOpenCancel}
              mobile
            />
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}

function OrderDetails({
  order,
  stage,
  cancelNote,
  onAdvance,
  onContact,
  onOpenCancel,
  mobile = false,
}: Readonly<{
  order: VendorOrder;
  stage: VendorOrderStage;
  cancelNote?: string | undefined;
  onAdvance: (order: VendorOrder) => void;
  onContact: (order: VendorOrder) => void;
  onOpenCancel: () => void;
  mobile?: boolean;
}>) {
  const currentStep = stage === "cancelled" ? -1 : ORDER_TIMELINE_STEPS.indexOf(stage);
  const actionable = isStageActionable(stage);

  return (
    <div className={styles.detailContent}>
      <header className={styles.detailHead}>
        <div>
          <p>Order {order.reference}</p>
          <div className="cluster">
            <Status tone={stageTone(stage, order.operational.priority)}>{stageLabel(stage)}</Status>
            <span className={styles.mode}>
              <Truck aria-hidden="true" />
              {order.fulfillmentMode === "pickup" ? "Pickup" : "Delivery"}
            </span>
          </div>
        </div>
        {mobile ? (
          <Dialog.Close asChild>
            <button type="button" className={styles.close} aria-label="Close order details">
              <X aria-hidden="true" />
            </button>
          </Dialog.Close>
        ) : null}
      </header>

      <section className={styles.customer}>
        <div>
          <strong>{order.customer.name}</strong>
          <span>{order.customer.phoneMasked}</span>
          <div style={{ marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span className="status status--success" style={{ fontSize: "0.62rem", padding: "2px 6px" }}>Verified Customer</span>
            {order.fulfillmentMode === "pickup" ? (
              <span className="status status--warning" style={{ fontSize: "0.62rem", padding: "2px 6px" }}>Pickup PIN: 4821</span>
            ) : null}
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => onContact(order)}>
          <MessageCircle aria-hidden="true" />
          Contact
        </Button>
      </section>

      <section className={styles.detailSection}>
        <h3>Items</h3>
        <ul className={styles.lineItems}>
          {order.items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>Qty: {item.quantity}</span>
                {item.selectedOptions.map((option) => (
                  <span key={`${option.name}-${option.value}`}>
                    {option.name}: {option.value}
                    {option.priceDelta.amount ? ` (+${formatMoney(option.priceDelta)})` : ""}
                  </span>
                ))}
                {item.instructions ? <span>Note: {item.instructions}</span> : null}
              </div>
              <b>{formatMoney(ngn(orderLineTotalAmount(item)))}</b>
            </li>
          ))}
        </ul>
        {order.operationalNote ? <p className={styles.note}>{order.operationalNote}</p> : null}
        {cancelNote ? <p className={styles.note}>Cancelled in preview: {cancelNote}</p> : null}
      </section>

      <section className={styles.detailSection}>
        <h3>{order.fulfillmentMode === "pickup" ? "Pickup details" : "Delivery address"}</h3>
        <p className={styles.address}>{order.operational.fulfillmentDetail}</p>
        <p className={styles.previewText}>Contact controls are preview-only; no call or message is sent.</p>
      </section>

      <section className={styles.detailSection}>
        <h3>Payment</h3>
        <dl className={styles.payment}>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotal)}</dd>
          </div>
          <div>
            <dt>Delivery fee</dt>
            <dd>{formatMoney(order.deliveryFee)}</dd>
          </div>
          <div>
            <dt>Service fee</dt>
            <dd>{formatMoney(order.serviceFee)}</dd>
          </div>
          <div className={styles.paymentTotal}>
            <dt>Total</dt>
            <dd>{formatMoney(order.total)}</dd>
          </div>
        </dl>
        <span className={styles.paymentBadge}>{order.operational.paymentLabel}</span>
      </section>

      <section className={styles.timeline}>
        <h3>Fulfilment timeline</h3>
        <ol>
          {ORDER_TIMELINE_STEPS.map((step, index) => (
            <li className={currentStep >= 0 && index <= currentStep ? styles.complete : undefined} key={step}>
              <span aria-hidden="true" />
              <div>
                <strong>{stageLabel(step)}</strong>
                <small>
                  {stage === "cancelled"
                    ? "Order cancelled in preview"
                    : index === currentStep
                      ? "Current preview status"
                      : index > currentStep
                        ? "Pending"
                        : "Completed in preview"}
                </small>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className={styles.detailFooter}>
        {actionable ? (
          <div className={styles.detailFooterActions}>
            <Button block onClick={() => onAdvance(order)}>
              {nextActionLabel(stage, order.fulfillmentMode)}
            </Button>
            <Button block size="sm" variant="ghost" onClick={onOpenCancel}>
              Cancel or report issue
            </Button>
          </div>
        ) : (
          <Button block disabled>
            {stageLabel(stage)}
          </Button>
        )}
        <p>Frontend preview only. No real fulfilment, rider dispatch, or payment changes occur.</p>
      </footer>
    </div>
  );
}

function EmptyDetails() {
  return (
    <div className={styles.emptyDetails}>
      <PackageCheck aria-hidden="true" />
      <h2>Select an order</h2>
      <p>Choose an order from the queue to inspect its fulfilment details.</p>
    </div>
  );
}
