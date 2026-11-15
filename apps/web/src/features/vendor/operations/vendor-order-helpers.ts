import type { VendorOrder } from "@mealhrs/domain";

export type VendorOrderStage =
  | "pending_vendor"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export const ORDER_TIMELINE_STEPS: readonly VendorOrderStage[] = [
  "pending_vendor",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
] as const;

export function initialOrderStage(order: VendorOrder): VendorOrderStage {
  if (order.orderStatus === "cancelled" || order.orderStatus === "timed_out") return "cancelled";
  if (order.fulfillmentStatus === "delivered") return "delivered";
  if (order.fulfillmentStatus === "delivery_failed") return "cancelled";
  if (order.fulfillmentStatus === "out_for_delivery") return "out_for_delivery";
  if (order.orderStatus === "ready" || order.fulfillmentStatus === "ready_for_dispatch") return "ready";
  if (order.orderStatus === "preparing" || order.fulfillmentStatus === "preparing") return "preparing";
  if (order.orderStatus === "confirmed") return "confirmed";
  return "pending_vendor";
}

export function stageLabel(stage: VendorOrderStage): string {
  switch (stage) {
    case "pending_vendor":
      return "new";
    case "confirmed":
      return "confirmed";
    case "preparing":
      return "preparing";
    case "ready":
      return "ready";
    case "out_for_delivery":
      return "out for delivery";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
  }
}

export function nextActionLabel(stage: VendorOrderStage, fulfillmentMode: "delivery" | "pickup"): string {
  switch (stage) {
    case "pending_vendor":
      return "Accept";
    case "confirmed":
      return "Start preparing";
    case "preparing":
      return "Mark ready";
    case "ready":
      return fulfillmentMode === "pickup" ? "Mark collected" : "Dispatch";
    case "out_for_delivery":
      return "Mark delivered";
    case "delivered":
    case "cancelled":
      return stageLabel(stage);
  }
}

export function nextStage(stage: VendorOrderStage, fulfillmentMode: "delivery" | "pickup"): VendorOrderStage {
  switch (stage) {
    case "pending_vendor":
      return "confirmed";
    case "confirmed":
      return "preparing";
    case "preparing":
      return "ready";
    case "ready":
      return fulfillmentMode === "pickup" ? "delivered" : "out_for_delivery";
    case "out_for_delivery":
      return "delivered";
    case "delivered":
    case "cancelled":
      return stage;
  }
}

export function isStageActionable(stage: VendorOrderStage): boolean {
  return stage !== "delivered" && stage !== "cancelled";
}

export function orderLineTotalAmount(item: VendorOrder["items"][number]): number {
  const optionTotal = item.selectedOptions.reduce((sum, option) => sum + option.priceDelta.amount, 0);
  return (item.unitPrice.amount + optionTotal) * item.quantity;
}

export type PrepDishAggregate = Readonly<{
  dishName: string;
  totalQuantity: number;
  optionCounts: readonly Readonly<{ label: string; count: number }>[];
  instructions: readonly string[];
}>;

export function aggregatePreparationList(
  orders: readonly VendorOrder[],
  stageFor: (order: VendorOrder) => VendorOrderStage,
): readonly PrepDishAggregate[] {
  const buckets = new Map<
    string,
    { totalQuantity: number; options: Map<string, number>; instructions: string[] }
  >();

  for (const order of orders) {
    const stage = stageFor(order);
    if (stage === "delivered" || stage === "cancelled") continue;
    for (const item of order.items) {
      const existing = buckets.get(item.name) ?? {
        totalQuantity: 0,
        options: new Map<string, number>(),
        instructions: [],
      };
      existing.totalQuantity += item.quantity;
      for (const option of item.selectedOptions) {
        const key = `${option.name}: ${option.value}`;
        existing.options.set(key, (existing.options.get(key) ?? 0) + item.quantity);
      }
      if (item.instructions?.trim()) {
        existing.instructions.push(`${order.reference}: ${item.instructions.trim()}`);
      }
      buckets.set(item.name, existing);
    }
  }

  return [...buckets.entries()].map(([dishName, data]) => ({
    dishName,
    totalQuantity: data.totalQuantity,
    optionCounts: [...data.options.entries()].map(([label, count]) => ({ label, count })),
    instructions: data.instructions,
  }));
}
