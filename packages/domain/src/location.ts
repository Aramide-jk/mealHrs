import type { AreaId, VendorId } from "./ids";
import type { Money } from "./money";

export type GeographicArea = Readonly<{
  id: AreaId;
  country: "NG";
  state: string;
  lga: string;
  name: string;
}>;

export type CustomerAddress = Readonly<{
  id: string;
  label: string;
  line1: string;
  areaId: AreaId;
  areaName: string;
  isDefault: boolean;
}>;

export type DeliveryEligibility =
  | Readonly<{
      status: "eligible";
      vendorId: VendorId;
      areaId: AreaId;
      deliveryFee: Money;
      estimate: string;
    }>
  | Readonly<{
      status: "pickup_only";
      vendorId: VendorId;
      areaId: AreaId;
      pickupWindow: string;
      reason: string;
    }>
  | Readonly<{
      status: "outside_area" | "delivery_paused";
      vendorId: VendorId;
      areaId: AreaId;
      reason: string;
    }>;
