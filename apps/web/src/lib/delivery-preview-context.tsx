"use client";

import type { AreaId, DeliveryEligibility, VendorDashboardSnapshot, VendorDeliveryZone, VendorId, VendorPickupSettings } from "@mealhrs/domain";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useCustomerContext } from "./customer-context";

export type DeliveryPreviewResult = Readonly<{
  eligibility: DeliveryEligibility;
  minimumOrder?: VendorDeliveryZone["minimumOrder"];
  pickup: VendorPickupSettings;
}>;

type DeliveryPreviewContextValue = Readonly<{
  vendorId: VendorId | null;
  zones: readonly VendorDeliveryZone[];
  pickup: VendorPickupSettings | null;
  addZone: (zone: VendorDeliveryZone) => void;
  updateZone: (areaId: AreaId, update: (zone: VendorDeliveryZone) => VendorDeliveryZone) => void;
  removeZone: (areaId: AreaId) => void;
  setPickup: (pickup: VendorPickupSettings) => void;
  resolve: (vendorId: VendorId, areaId: AreaId, orderingMode: "immediate" | "meal_drop") => DeliveryPreviewResult | null;
}>;

const emptyContext: DeliveryPreviewContextValue = {
  vendorId: null,
  zones: [],
  pickup: null,
  addZone: () => undefined,
  updateZone: () => undefined,
  removeZone: () => undefined,
  setPickup: () => undefined,
  resolve: () => null,
};

const DeliveryPreviewContext = createContext<DeliveryPreviewContextValue>(emptyContext);

export function DeliveryPreviewProvider({ children, dashboard }: Readonly<{ children: ReactNode; dashboard: VendorDashboardSnapshot | null }>) {
  const { addPreviewArea } = useCustomerContext();
  const [zones, setZones] = useState<readonly VendorDeliveryZone[]>(() => dashboard?.deliveryZones ?? []);
  const [pickup, setPickup] = useState<VendorPickupSettings | null>(() => dashboard?.pickupSettings ?? null);
  const vendorId = dashboard?.vendor.id ?? null;

  const addZone = useCallback((zone: VendorDeliveryZone) => {
    setZones((current) => current.some((item) => item.areaId === zone.areaId) ? current.map((item) => item.areaId === zone.areaId ? zone : item) : [...current, zone]);
    addPreviewArea({ id: zone.areaId, name: zone.name, state: "Lagos" });
  }, [addPreviewArea]);

  const updateZone = useCallback((areaId: AreaId, update: (zone: VendorDeliveryZone) => VendorDeliveryZone) => {
    setZones((current) => current.map((zone) => zone.areaId === areaId ? update(zone) : zone));
  }, []);

  const removeZone = useCallback((areaId: AreaId) => {
    setZones((current) => current.filter((zone) => zone.areaId !== areaId));
  }, []);

  const resolve = useCallback((targetVendorId: VendorId, areaId: AreaId, orderingMode: "immediate" | "meal_drop"): DeliveryPreviewResult | null => {
    if (!vendorId || targetVendorId !== vendorId || !pickup) return null;
    const zone = zones.find((item) => item.areaId === areaId);
    const pickupAvailable = pickup.mode !== "delivery";
    const orderingEnabled = orderingMode === "immediate" ? zone?.immediateEnabled : zone?.scheduledEnabled;
    if (zone?.enabled && orderingEnabled) {
      return { eligibility: { status: "eligible", vendorId, areaId, deliveryFee: zone.deliveryFee, estimate: zone.estimate }, minimumOrder: zone.minimumOrder, pickup };
    }
    if (pickupAvailable) {
      return { eligibility: { status: "pickup_only", vendorId, areaId, pickupWindow: pickup.windowNote, reason: zone?.enabled ? `Delivery is not enabled for ${orderingMode === "immediate" ? "immediate orders" : "pre-orders"} in ${zone.name}.` : "This kitchen does not deliver to this area yet. Pickup is available." }, pickup };
    }
    return { eligibility: { status: "outside_area", vendorId, areaId, reason: zone ? `This kitchen is not accepting ${orderingMode === "immediate" ? "immediate orders" : "pre-orders"} for ${zone.name}.` : "This kitchen does not deliver to this area yet." }, pickup };
  }, [pickup, vendorId, zones]);

  const value = useMemo<DeliveryPreviewContextValue>(() => ({ vendorId, zones, pickup, addZone, updateZone, removeZone, setPickup, resolve }), [vendorId, zones, pickup, addZone, updateZone, removeZone, setPickup, resolve]);
  return <DeliveryPreviewContext.Provider value={value}>{children}</DeliveryPreviewContext.Provider>;
}

export function useDeliveryPreview() { return useContext(DeliveryPreviewContext); }
