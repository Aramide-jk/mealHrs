"use client";

import { asAreaId, type AreaId } from "@mealhrs/domain";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ActiveArea = Readonly<{ id: AreaId; name: string; state: string }>;

type CustomerContextValue = Readonly<{
  activeArea: ActiveArea;
  availableAreas: readonly ActiveArea[];
  setActiveArea: (area: ActiveArea) => void;
  isSignedIn: boolean;
  setSignedIn: (value: boolean) => void;
  pendingIntent: string | null;
  setPendingIntent: (path: string | null) => void;
}>;

const CustomerContext = createContext<CustomerContextValue | null>(null);

const defaultArea: ActiveArea = {
  id: asAreaId("area-ikotun"),
  name: "Ikotun",
  state: "Lagos",
};

export function CustomerContextProvider({ children, initialAreaId, initialAreas }: { children: ReactNode; initialAreaId?: AreaId; initialAreas: readonly ActiveArea[] }) {
  const availableAreas = useMemo(
    () => (initialAreas.length ? initialAreas : [defaultArea]),
    [initialAreas],
  );
  const [activeArea, setActiveAreaState] = useState(
    availableAreas.find((area) => area.id === initialAreaId) ?? availableAreas[0] ?? defaultArea,
  );
  const [isSignedIn, setSignedIn] = useState(true);
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);
  const setActiveArea = useCallback((area: ActiveArea) => {
    document.cookie = `mealhrs_active_area=${area.id}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setActiveAreaState(area);
  }, []);

  const value = useMemo(
    () => ({
      activeArea,
      availableAreas,
      setActiveArea,
      isSignedIn,
      setSignedIn,
      pendingIntent,
      setPendingIntent,
    }),
    [activeArea, availableAreas, isSignedIn, pendingIntent, setActiveArea],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomerContext() {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomerContext must be used within CustomerContextProvider");
  return context;
}
