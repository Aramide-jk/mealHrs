"use client";

import type { CustomerAddress } from "@mealhrs/domain";
import { asAddressId, asAreaId } from "@mealhrs/domain";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { VendorOrderStage } from "@/features/vendor/operations/vendor-order-helpers";

export type CustomerReviewRecord = Readonly<{
  id: string;
  orderId: string;
  vendorId: string;
  vendorName: string;
  authorName: string;
  ratings: Record<string, number>;
  averageRating: number;
  comment: string;
  createdAt: string;
}>;

export type RiderDetails = Readonly<{
  name: string;
  phone: string;
  vehicle: string;
}>;

export type CustomerActivityContextValue = Readonly<{
  // Saved items
  savedMealIds: readonly string[];
  savedPostIds: readonly string[];
  savedVendorIds: readonly string[];
  toggleSaveMeal: (id: string) => void;
  toggleSavePost: (id: string) => void;
  toggleSaveVendor: (id: string) => void;
  isMealSaved: (id: string) => boolean;
  isPostSaved: (id: string) => boolean;
  isVendorSaved: (id: string) => boolean;

  // Followed vendors
  followedVendorIds: readonly string[];
  toggleFollowVendor: (vendorId: string) => void;
  isVendorFollowed: (vendorId: string) => boolean;

  // Addresses
  addresses: readonly CustomerAddress[];
  saveAddress: (address: CustomerAddress) => void;
  setDefaultAddress: (id: string) => void;
  deleteAddress: (id: string) => void;

  // Orders progression & tracking
  orderStages: Record<string, VendorOrderStage>;
  orderCancellationNotes: Record<string, string>;
  updateOrderStage: (idOrRef: string, stage: VendorOrderStage, note?: string) => void;
  getOrderStage: (idOrRef: string) => VendorOrderStage | undefined;
  getOrderCancellationNote: (idOrRef: string) => string | undefined;
  orderPickupPins: Record<string, string>;
  orderRiderDetails: Record<string, RiderDetails>;

  // Customer Reviews
  reviews: readonly CustomerReviewRecord[];
  addReview: (review: CustomerReviewRecord) => void;
  getVendorReviews: (vendorId: string) => readonly CustomerReviewRecord[];

  // Vendor Kitchen Rush mode
  kitchenRushEnabled: boolean;
  toggleKitchenRush: (enabled?: boolean) => void;
  rushPrepExtraMinutes: number;
}>;

const defaultAddresses: readonly CustomerAddress[] = [
  {
    id: asAddressId("address-home"),
    label: "Home",
    line1: "12 Community Road, Ikotun, Lagos",
    areaId: asAreaId("area-ikotun"),
    areaName: "Ikotun",
    isDefault: true,
  },
  {
    id: asAddressId("address-work"),
    label: "Work",
    line1: "18 Allen Avenue, Ikeja, Lagos",
    areaId: asAreaId("area-ikeja"),
    areaName: "Ikeja",
    isDefault: false,
  },
];

const defaultReviews: readonly CustomerReviewRecord[] = [
  {
    id: "rev-seed-1",
    orderId: "order-mh-19402",
    vendorId: "vendor-amaka",
    vendorName: "Amaka's Kitchen",
    authorName: "Chinedu O.",
    ratings: { "Food quality": 5, "Portion and value": 5, "Fulfillment reliability": 5 },
    averageRating: 5.0,
    comment: "The native goat meat jollof is genuinely top tier. Tender meat and authentic smoky flavor. Hot delivery right on time.",
    createdAt: "2026-11-14T14:30:00Z",
  },
  {
    id: "rev-seed-2",
    orderId: "order-mh-19120",
    vendorId: "vendor-amaka",
    vendorName: "Amaka's Kitchen",
    authorName: "Amina B.",
    ratings: { "Food quality": 5, "Portion and value": 4, "Fulfillment reliability": 5 },
    averageRating: 4.7,
    comment: "Great packaging, no oil spills at all. Plantain portions were generous.",
    createdAt: "2026-11-10T12:15:00Z",
  },
];

const defaultRider: RiderDetails = {
  name: "Tunde Bakare",
  phone: "+234 803 123 4567",
  vehicle: "Honda Ace 125 (KJA-482-XY)",
};

const emptyContext: CustomerActivityContextValue = {
  savedMealIds: [],
  savedPostIds: [],
  savedVendorIds: [],
  toggleSaveMeal: () => undefined,
  toggleSavePost: () => undefined,
  toggleSaveVendor: () => undefined,
  isMealSaved: () => false,
  isPostSaved: () => false,
  isVendorSaved: () => false,

  followedVendorIds: [],
  toggleFollowVendor: () => undefined,
  isVendorFollowed: () => false,

  addresses: defaultAddresses,
  saveAddress: () => undefined,
  setDefaultAddress: () => undefined,
  deleteAddress: () => undefined,

  orderStages: {},
  orderCancellationNotes: {},
  updateOrderStage: () => undefined,
  getOrderStage: () => undefined,
  getOrderCancellationNote: () => undefined,
  orderPickupPins: {},
  orderRiderDetails: {},

  reviews: defaultReviews,
  addReview: () => undefined,
  getVendorReviews: () => [],

  kitchenRushEnabled: false,
  toggleKitchenRush: () => undefined,
  rushPrepExtraMinutes: 15,
};

const CustomerActivityContext = createContext<CustomerActivityContextValue>(emptyContext);

export function CustomerActivityProvider({
  children,
  initialAddresses = defaultAddresses,
  initialFollowedVendorIds = ["vendor-amaka"],
  initialSavedMealIds = ["dish-jollof-plate", "offer-jollof-reg"],
  initialSavedPostIds = ["post-jollof-prep"],
}: Readonly<{
  children: ReactNode;
  initialAddresses?: readonly CustomerAddress[];
  initialFollowedVendorIds?: readonly string[];
  initialSavedMealIds?: readonly string[];
  initialSavedPostIds?: readonly string[];
}>) {
  const [savedMealIds, setSavedMealIds] = useState<readonly string[]>(initialSavedMealIds);
  const [savedPostIds, setSavedPostIds] = useState<readonly string[]>(initialSavedPostIds);
  const [savedVendorIds, setSavedVendorIds] = useState<readonly string[]>(initialFollowedVendorIds);
  const [followedVendorIds, setFollowedVendorIds] = useState<readonly string[]>(initialFollowedVendorIds);
  const [addresses, setAddresses] = useState<readonly CustomerAddress[]>(initialAddresses);
  const [orderStages, setOrderStages] = useState<Record<string, VendorOrderStage>>({
    "order-mh-20481": "preparing",
    "MH-20481": "preparing",
    "vo-001": "preparing",
  });
  const [orderCancellationNotes, setOrderCancellationNotes] = useState<Record<string, string>>({});
  const [orderPickupPins] = useState<Record<string, string>>({
    "order-mh-20481": "4821",
    "MH-20481": "4821",
    "vo-001": "4821",
  });
  const [orderRiderDetails] = useState<Record<string, RiderDetails>>({
    "order-mh-20481": defaultRider,
    "MH-20481": defaultRider,
    "vo-001": defaultRider,
  });
  const [reviews, setReviews] = useState<readonly CustomerReviewRecord[]>(defaultReviews);
  const [kitchenRushEnabled, setKitchenRushEnabled] = useState(false);

  const toggleSaveMeal = useCallback((id: string) => {
    setSavedMealIds((curr) => (curr.includes(id) ? curr.filter((item) => item !== id) : [...curr, id]));
  }, []);

  const toggleSavePost = useCallback((id: string) => {
    setSavedPostIds((curr) => (curr.includes(id) ? curr.filter((item) => item !== id) : [...curr, id]));
  }, []);

  const toggleSaveVendor = useCallback((id: string) => {
    setSavedVendorIds((curr) => (curr.includes(id) ? curr.filter((item) => item !== id) : [...curr, id]));
  }, []);

  const isMealSaved = useCallback((id: string) => savedMealIds.includes(id), [savedMealIds]);
  const isPostSaved = useCallback((id: string) => savedPostIds.includes(id), [savedPostIds]);
  const isVendorSaved = useCallback((id: string) => savedVendorIds.includes(id), [savedVendorIds]);

  const toggleFollowVendor = useCallback((vendorId: string) => {
    setFollowedVendorIds((curr) =>
      curr.includes(vendorId) ? curr.filter((id) => id !== vendorId) : [...curr, vendorId],
    );
  }, []);

  const isVendorFollowed = useCallback(
    (vendorId: string) => followedVendorIds.includes(vendorId),
    [followedVendorIds],
  );

  const saveAddress = useCallback((address: CustomerAddress) => {
    setAddresses((curr) => {
      const exists = curr.some((a) => a.id === address.id);
      if (exists) {
        return curr.map((a) => (a.id === address.id ? address : address.isDefault ? { ...a, isDefault: false } : a));
      }
      return address.isDefault ? [...curr.map((a) => ({ ...a, isDefault: false })), address] : [...curr, address];
    });
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((curr) => curr.map((a) => ({ ...a, isDefault: a.id === id })));
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setAddresses((curr) => curr.filter((a) => a.id !== id));
  }, []);

  const updateOrderStage = useCallback((idOrRef: string, stage: VendorOrderStage, note?: string) => {
    setOrderStages((curr) => ({
      ...curr,
      [idOrRef]: stage,
      // Also map standard identifiers if known
      ...(idOrRef === "vo-001" || idOrRef === "MH-20481" || idOrRef === "order-mh-20481"
        ? { "vo-001": stage, "MH-20481": stage, "order-mh-20481": stage }
        : {}),
    }));
    if (note) {
      setOrderCancellationNotes((curr) => ({
        ...curr,
        [idOrRef]: note,
        ...(idOrRef === "vo-001" || idOrRef === "MH-20481" || idOrRef === "order-mh-20481"
          ? { "vo-001": note, "MH-20481": note, "order-mh-20481": note }
          : {}),
      }));
    }
  }, []);

  const getOrderStage = useCallback(
    (idOrRef: string): VendorOrderStage | undefined => orderStages[idOrRef],
    [orderStages],
  );

  const getOrderCancellationNote = useCallback(
    (idOrRef: string): string | undefined => orderCancellationNotes[idOrRef],
    [orderCancellationNotes],
  );

  const addReview = useCallback((review: CustomerReviewRecord) => {
    setReviews((curr) => [review, ...curr]);
  }, []);

  const getVendorReviews = useCallback(
    (vendorId: string) => reviews.filter((r) => r.vendorId === vendorId),
    [reviews],
  );

  const toggleKitchenRush = useCallback((enabled?: boolean) => {
    setKitchenRushEnabled((curr) => (typeof enabled === "boolean" ? enabled : !curr));
  }, []);

  const value = useMemo<CustomerActivityContextValue>(
    () => ({
      savedMealIds,
      savedPostIds,
      savedVendorIds,
      toggleSaveMeal,
      toggleSavePost,
      toggleSaveVendor,
      isMealSaved,
      isPostSaved,
      isVendorSaved,

      followedVendorIds,
      toggleFollowVendor,
      isVendorFollowed,

      addresses,
      saveAddress,
      setDefaultAddress,
      deleteAddress,

      orderStages,
      orderCancellationNotes,
      updateOrderStage,
      getOrderStage,
      getOrderCancellationNote,
      orderPickupPins,
      orderRiderDetails,

      reviews,
      addReview,
      getVendorReviews,

      kitchenRushEnabled,
      toggleKitchenRush,
      rushPrepExtraMinutes: 15,
    }),
    [
      savedMealIds,
      savedPostIds,
      savedVendorIds,
      toggleSaveMeal,
      toggleSavePost,
      toggleSaveVendor,
      isMealSaved,
      isPostSaved,
      isVendorSaved,

      followedVendorIds,
      toggleFollowVendor,
      isVendorFollowed,

      addresses,
      saveAddress,
      setDefaultAddress,
      deleteAddress,

      orderStages,
      orderCancellationNotes,
      updateOrderStage,
      getOrderStage,
      getOrderCancellationNote,
      orderPickupPins,
      orderRiderDetails,

      reviews,
      addReview,
      getVendorReviews,

      kitchenRushEnabled,
      toggleKitchenRush,
    ],
  );

  return <CustomerActivityContext.Provider value={value}>{children}</CustomerActivityContext.Provider>;
}

export function useCustomerActivity() {
  return useContext(CustomerActivityContext);
}
