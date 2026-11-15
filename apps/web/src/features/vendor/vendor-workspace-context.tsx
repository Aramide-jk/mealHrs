"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type VendorWorkspaceHeaderState = Readonly<{
  displayName: string;
  slug: string;
  publicArea: string;
  acceptsOrders: boolean;
  pauseImmediate: boolean;
  pausePreorders: boolean;
  unreadNotifications: number;
}>;

type VendorWorkspaceContextValue = VendorWorkspaceHeaderState & Readonly<{
  setAcceptsOrders: (value: boolean) => void;
  setPauseImmediate: (value: boolean) => void;
  setPausePreorders: (value: boolean) => void;
  updateStorefrontMeta: (patch: Partial<Pick<VendorWorkspaceHeaderState, "displayName" | "slug" | "publicArea" | "acceptsOrders">>) => void;
  setUnreadNotifications: (count: number) => void;
}>;

const defaultState: VendorWorkspaceHeaderState = {
  displayName: "Amaka's Kitchen",
  slug: "amakas-kitchen",
  publicArea: "Ikotun, Lagos",
  acceptsOrders: true,
  pauseImmediate: false,
  pausePreorders: false,
  unreadNotifications: 2,
};

const VendorWorkspaceContext = createContext<VendorWorkspaceContextValue | null>(null);

export function VendorWorkspaceProvider({
  children,
  initial = defaultState,
}: Readonly<{
  children: ReactNode;
  initial?: VendorWorkspaceHeaderState;
}>) {
  const [state, setState] = useState<VendorWorkspaceHeaderState>(initial);

  const setAcceptsOrders = useCallback((acceptsOrders: boolean) => {
    setState((current) => ({ ...current, acceptsOrders }));
  }, []);

  const setPauseImmediate = useCallback((pauseImmediate: boolean) => {
    setState((current) => ({ ...current, pauseImmediate }));
  }, []);

  const setPausePreorders = useCallback((pausePreorders: boolean) => {
    setState((current) => ({ ...current, pausePreorders }));
  }, []);

  const updateStorefrontMeta = useCallback(
    (patch: Partial<Pick<VendorWorkspaceHeaderState, "displayName" | "slug" | "publicArea" | "acceptsOrders">>) => {
      setState((current) => ({ ...current, ...patch }));
    },
    [],
  );

  const setUnreadNotifications = useCallback((unreadNotifications: number) => {
    setState((current) => ({ ...current, unreadNotifications: Math.max(0, unreadNotifications) }));
  }, []);

  const value = useMemo<VendorWorkspaceContextValue>(
    () => ({
      ...state,
      setAcceptsOrders,
      setPauseImmediate,
      setPausePreorders,
      updateStorefrontMeta,
      setUnreadNotifications,
    }),
    [state, setAcceptsOrders, setPauseImmediate, setPausePreorders, updateStorefrontMeta, setUnreadNotifications],
  );

  return <VendorWorkspaceContext.Provider value={value}>{children}</VendorWorkspaceContext.Provider>;
}

export function useVendorWorkspace() {
  return useContext(VendorWorkspaceContext) ?? {
    ...defaultState,
    setAcceptsOrders: () => undefined,
    setPauseImmediate: () => undefined,
    setPausePreorders: () => undefined,
    updateStorefrontMeta: () => undefined,
    setUnreadNotifications: () => undefined,
  };
}
