"use client";

import { asAreaId, type AreaId } from "@mealhrs/domain";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ActiveArea = Readonly<{ id: AreaId; name: string; state: string }>;

type CustomerContextValue = Readonly<{
  activeArea: ActiveArea;
  availableAreas: readonly ActiveArea[];
  addPreviewArea: (area: ActiveArea) => void;
  setActiveArea: (area: ActiveArea) => void;
  isSignedIn: boolean;
  setSignedIn: (value: boolean) => void;
  pendingIntent: string | null;
  setPendingIntent: (path: string | null) => void;
  isVendorCustomerView: boolean;
  startVendorCustomerView: () => void;
}>;

const CustomerContext = createContext<CustomerContextValue | null>(null);

const defaultArea: ActiveArea = {
  id: asAreaId("area-ikotun"),
  name: "Ikotun",
  state: "Lagos",
};

export function CustomerContextProvider({
  children,
  initialAreaId,
  initialAreas,
  initialIsVendorCustomerView = false,
}: {
  children: ReactNode;
  initialAreaId?: AreaId;
  initialAreas: readonly ActiveArea[];
  initialIsVendorCustomerView?: boolean;
}) {
  const [availableAreas, setAvailableAreas] = useState<readonly ActiveArea[]>(() => initialAreas.length ? initialAreas : [defaultArea]);
  const [activeArea, setActiveAreaState] = useState(
    availableAreas.find((area) => area.id === initialAreaId) ?? availableAreas[0] ?? defaultArea,
  );
  const [isSignedIn, setSignedIn] = useState(true);
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);
  const [isVendorCustomerView, setVendorCustomerView] = useState(initialIsVendorCustomerView);

  const startVendorCustomerView = useCallback(() => {
    if (typeof document !== "undefined") {
      document.cookie = "mealhrs_vendor_view=1; Path=/; Max-Age=86400; SameSite=Lax";
    }
    setVendorCustomerView(true);
  }, []);
  const setActiveArea = useCallback((area: ActiveArea) => {
    document.cookie = `mealhrs_active_area=${area.id}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setActiveAreaState(area);
  }, []);
  const addPreviewArea = useCallback((area: ActiveArea) => {
    setAvailableAreas((current) => current.some((item) => item.id === area.id) ? current : [...current, area]);
  }, []);

  const value = useMemo(
    () => ({
      activeArea,
      availableAreas,
      addPreviewArea,
      setActiveArea,
      isSignedIn,
      setSignedIn,
      pendingIntent,
      setPendingIntent,
      isVendorCustomerView,
      startVendorCustomerView,
    }),
    [activeArea, availableAreas, addPreviewArea, isSignedIn, pendingIntent, setActiveArea, isVendorCustomerView, startVendorCustomerView],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomerContext() {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomerContext must be used within CustomerContextProvider");
  return context;
}
