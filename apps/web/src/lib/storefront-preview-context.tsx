"use client";

import type { VendorDashboardSnapshot, VendorId, VendorStorefrontSettings } from "@mealhrs/domain";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type StorefrontPreviewContextValue = Readonly<{
  vendorId: VendorId | null;
  storefront: VendorStorefrontSettings | null;
  updateStorefront: (patch: Partial<VendorStorefrontSettings>) => void;
  resolveStorefront: (targetVendorId: VendorId) => VendorStorefrontSettings | null;
}>;

const emptyContext: StorefrontPreviewContextValue = {
  vendorId: null,
  storefront: null,
  updateStorefront: () => undefined,
  resolveStorefront: () => null,
};

const StorefrontPreviewContext = createContext<StorefrontPreviewContextValue>(emptyContext);

export function StorefrontPreviewProvider({
  children,
  dashboard,
}: Readonly<{
  children: ReactNode;
  dashboard: VendorDashboardSnapshot | null;
}>) {
  const [storefront, setStorefront] = useState<VendorStorefrontSettings | null>(
    () => dashboard?.storefront ?? null,
  );
  const vendorId = dashboard?.vendor.id ?? null;

  const updateStorefront = useCallback((patch: Partial<VendorStorefrontSettings>) => {
    setStorefront((current) => (current ? { ...current, ...patch } : null));
  }, []);

  const resolveStorefront = useCallback(
    (targetVendorId: VendorId): VendorStorefrontSettings | null => {
      if (!vendorId || targetVendorId !== vendorId || !storefront) return null;
      return storefront;
    },
    [vendorId, storefront],
  );

  const value = useMemo<StorefrontPreviewContextValue>(
    () => ({ vendorId, storefront, updateStorefront, resolveStorefront }),
    [vendorId, storefront, updateStorefront, resolveStorefront],
  );

  return (
    <StorefrontPreviewContext.Provider value={value}>
      {children}
    </StorefrontPreviewContext.Provider>
  );
}

export function useStorefrontPreview() {
  return useContext(StorefrontPreviewContext);
}
